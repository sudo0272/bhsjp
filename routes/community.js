const express = require('express');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const RedisStore = require('connect-redis')(expressSession);
const redisClient = require('../models/getRedisClient').getRedisClient();
const getPostList = require('../controllers/getPostList').getPostList;
const getPostCount = require('../controllers/getPostCount').getPostCount;
const getPostTitle = require('../controllers/getPostTitle').getPostTitle;
const getPostPassword = require('../controllers/getPostPassword').getPostPassword;
const getPost = require('../controllers/getPost').getPost;
const createPost = require('../controllers/createPost').createPost;
const encryptSha512 = require('../models/encryptSha512').encryptSha512;
const isUserPostOwner = require('../controllers/isUserPostOwner').isUserPostOwner;
const Aes256 = require('../lib/Aes256');
const fetch = require('node-fetch');

const communityRouter = express.Router();

communityRouter.use(bodyParser.urlencoded({
    extended: true
}));

communityRouter.use(bodyParser.json());
communityRouter.use(bodyParser.raw());

communityRouter.use(expressSession({
    secret: "f%*JNsNn!tFfdqog#Ba7oITKgLW0YYKOm1ARil6MW#BKlmMSrC@LSZnA5E#0!EY63#R%U!NH1#PM4AV80PVDGQDuQbHgZ%&5BEN",
    resave: false,
    saveUninitialized: true,
    store: new RedisStore({
        client: redisClient,
        resave: false,
        saveUninitialized: true
    }),
    cookie: {
        secure: true,
        name: '.bhsjp.kro.kr',
        domain: 'bhsjp.kro.kr',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

communityRouter.get('/', (req, res) => {
    res.render('community/index', {
        title: '커뮤니티',
        isSignedIn: !!req.session.user
    });
});

communityRouter.get('/view-posts/:postListCount', (req, res) => {
    if (req.params.postListCount !== undefined) {
        if (req.params.postListCount.match(/^\d+$/)) {
            const postListCount = parseInt(req.params.postListCount);

            getPostList(postListCount)
            .then(postItems => {
                getPostCount()
                .then(postCount => {
                    res.render('community/view-posts', {
                        title: '글 보기',
                        isSignedIn: !!req.session.user,
                        postItems: postItems,
                        postListCount: postListCount,
                        postCount: postCount
                    });
                }).catch(error => {
                    console.error(error);

                    res.render('errors/500', {
                        title: '500 Internal Server Error',
                        isSignedIn: !!req.session.user
                    });
                });
            }, reason => {
                res.render('errors/404', {
                    'title': '404 Not Found',
                    'isSignedIn': req.session.user
                });
            }).catch(error => {
                console.error(error);

                res.render('errors/500', {
                    title: '500 Internal Server Error',
                    isSignedIn: !!req.session.user
                });
            });
        } else {
            res.render('errors/404', {
                'title': '404 Not Found',
                'isSignedIn': req.session.user
            });
        }
    } else {
        res.render('errors/404', {
            'title': '404 Not Found',
            'isSignedIn': req.session.user
        });
    }
});

communityRouter.post('/do-post-list-exist', (req, res) => {
    const postList = req.body.postList;

    if (postList.match(/^\d+$/)) {
        getPostList(postList)
            .then(() => {
                res.send('ok');
            }, () => {
                res.send('no-list');
            }).catch(error => {
                console.error(error);

                res.send('error');
            })
    } else {
        res.send('number-format-not-match');
    }
});

communityRouter.get('/read-post/:postId', (req, res) => {
    const postId = req.params.postId;

    if (postId.match(/^\d+$/)) {
        getPostTitle(postId)
        .then(title => {
            if (req.session.user) {
                isUserPostOwner(req.session.user.id, postId)
                .then(owner => {
                    res.render('community/read-post', {
                        title: title,
                        isSignedIn: req.session.user,
                        postId: postId,
                        owner: owner
                    });
                });
            } else {
                res.render('community/read-post', {
                    title: title,
                    isSignedIn: req.session.user,
                    postId: postId
                });
            }
        }, reason => {
            res.render('errors/404', {
                'title': '404 Not Found',
                'isSignedIn': req.session.user
            });
        }).catch(error => {
            console.error(error);

            res.render('errors/500', {
                title: '500 Internal Server Error',
                isSignedIn: !!req.session.user
            });
        });
    } else {
        res.render('errors/404', {
            'title': '404 Not Found',
            'isSignedIn': req.session.user
        });
    }
});

communityRouter.post('/get-post', (req, res) => {
    const aes256 = new Aes256();
    const postId = req.body.postId;
    const userPassword = req.body.password;

    getPostPassword(postId)
    .then(dbPassword => {
        if (dbPassword === null || dbPassword === encryptSha512(userPassword)) {
            getPost(postId).then(result => {
                res.send({
                    result: 'right',
                    data: {
                        nickname: aes256.decrypt(result[0].nickname),
                        date: result[0].date,
                        content: result[0].content
                    }
                });
            }, reason => {
                res.send({
                    result: 'no-post'
                });
            }).catch(error => {
                console.error(error);

                res.send({
                    result: 'error'
                });
            });
        } else {
            res.send({
                result: 'wrong'
            });
        }
    }, reason => {
        res.send({
            result: 'no-post'
        });
    }).catch(error => {
        console.error(error);

        res.send({
            result: 'error'
        });
    });
});

communityRouter.get('/new-post', (req, res) => {
    res.render('community/new-post', {
        title: '새 글 작성',
        isSignedIn: !!req.session.user
    });
});

communityRouter.post('/create-post', (req, res) => {
    const title = req.body.title;
    const password = req.body.password;
    const content = req.body.content;

    if (req.session.user) {
        if (title.length === 0) {
            res.send('empty-title');
        } else if (content.replace(/<.*?>/g, '').length === 0) {
            res.send('empty-content');
        } else {
            createPost(req.session.user.id, title, (password.length > 0 ? password : null), content)
            .then(() => {
                res.send('ok');
            }).catch(error => {
                console.error(error);

                res.send('error');
            });
        }
    } else {
        res.send('not-signed-in');
    }
});

communityRouter.get('/fix-post/:postId', (req, res) => {
    fetch('/get-post', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            postId: postId,
            password: password
        })
    });

    res.render('community/fix-post', {
        title: '새 글 수정',
        isSignedIn: !!req.session.user
    });
});

communityRouter.post('/update-post', (req, res) => {
    // TODO: check if user has signed in, if user is the person who wrote the post and if the post exist
});

communityRouter.post('delete-post', (req, res) => {
    // TODO: check if user has signed in, if user is the person who wrote the post and if the post exists
});

communityRouter.post('/create-comment', (req, res) => {
    // TODO: check if user has signed in, if user is the person who wrote the comment and if the comment exist
});

communityRouter.post('/update-comment', (req, res) => {
    // TODO: check if user has signed in, if user is the person who wrote the comment and if the comment exist
});

communityRouter.post('/delete-post', (req, res) => {
    // TODO: check if user has signed in, if user is the person who wrote the comment and if the comment exists
});

communityRouter.get('/*', (req, res) => {
    res.render('errors/404', {
        'title': '404 Not Found',
        'isSignedIn': req.session.user
    });
});

module.exports = {
    router: communityRouter
};
