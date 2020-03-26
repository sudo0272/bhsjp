const express = require('express');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const RedisStore = require('connect-redis')(expressSession);
const RedisData = require('../models/RedisData');
const SessionData = require('../models/SessionData');
const redisClient = new RedisData().getClient();
const Post = require('../controllers/Post');
const PostList = require('../controllers/PostList');
const Comment = require('../controllers/Comment');
const CommentList = require('../controllers/CommentList');
const Sha512 = require('../lib/Sha512');
const Aes256 = require('../lib/Aes256');
const fetch = require('node-fetch');
const morgan = require('morgan');
const i18n = require('i18n');
const fs = require('fs');
const log = require('../lib/log');
const cookieParser = require('cookie-parser');
const I18nData = require('../models/I18nData');
const i18nData = new I18nData();
const views = require('../models/views');

const sessionData = new SessionData();

const communityRouter = express.Router();

communityRouter.use(bodyParser.urlencoded({
    extended: true
}));

communityRouter.use(bodyParser.json());
communityRouter.use(bodyParser.raw());

communityRouter.use(expressSession({
    secret: sessionData.getSecret(),
    resave: sessionData.getResave(),
    saveUninitialized: sessionData.getSaveUninitialized(),
    store: eval(sessionData.getStore()),
    cookie: {
        secure: sessionData.getCookieSecure(),
        name: sessionData.getCookieName(),
        domain: sessionData.getCookieDomain(),
        httpOnly: sessionData.getCookieHttpOnly(),
        maxAge: sessionData.getMaxAge()
    }
}));

communityRouter.use(morgan(':remote-addr - :remote-user [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', {
    stream: fs.createWriteStream('/var/log/bhsjp/access.log', {
        flags: 'a'
    })
}));

morgan.token('remote-user', (req, res) => {
    return (req.session && req.session.user) ? req.session.user.id : '-';
});

communityRouter.use(cookieParser());

i18n.configure({
    locales:       i18nData.getLocales(),
    defaultLocale: i18nData.getDefaultLocale(),
    cookie:        i18nData.getCookieName(),
    directory:     i18nData.getDirectoryPath(),
    updateFiles:   i18nData.getUpdateFiles(),
    register:      i18nData.getRegister()
});

communityRouter.use(i18n.init);

communityRouter.get('/', (req, res) => {
    const __community = __('community');

    res.end(views.community.index({
        title: __community.index.title,
        isSignedIn: !!req.session.user
    }));
});

communityRouter.get('/view-posts/:postListCount', (req, res) => {
    const postList = new PostList();
    let order = req.query.order;
    const searchOption = (typeof req.query.searchOption === 'string' && (req.query.searchOption === 'title' || req.query.searchOption === 'content')) ? req.query.searchOption : 'title';
    const searchKeyword = req.query.searchKeyword;

    if (order === undefined || (order !== 'asc' && order !== 'desc')) {
        order = 'desc';
    }

    if (req.params.postListCount !== undefined) {
        const postListCount = parseInt(req.params.postListCount);
        const __community = __('community');

        if (!isNaN(postListCount)) {
            postList
                .read(postListCount, 20, order, searchOption, searchKeyword)
                .then(postItems => {
                    postList
                        .getCount()
                        .then(postCount => {
                            res.end(views.community.viewPosts({
                                title: __community.viewPosts.title,
                                isSignedIn: !!req.session.user,
                                postItems: postItems,
                                postListCount: postListCount,
                                postCount: postCount,
                                order: order,
                                previousSearchOption: searchOption,
                                previousSearchKeyword: searchKeyword
                            }));
                        }).catch(error => {
                            log('error', error.toString());

                            res.end(views.errors['500']({
                                title: '500 Internal Server Error',
                                isSignedIn: !!req.session.user
                            }));
                        }
                    );
                }, reason => {
                    res.end(views.community.viewPosts({
                        title: __community.viewPosts.title,
                        isSignedIn: !!req.session.user,
                        postItems: [],
                        postListCount: postListCount,
                        postCount: 0,
                        order: order,
                        previousSearchOption: searchOption,
                        previousSearchKeyword: searchKeyword
                    }));
                }).catch(error => {
                    log('error', error.toString());

                    res.end(views.errors['500']({
                        title: '500 Internal Server Error',
                        isSignedIn: !!req.session.user
                    }));
                }
            );
        } else {
            res.end(views.errors['404']({
                'title': '404 Not Found',
                'isSignedIn': req.session.user
            }));
        }
    } else {
        res.end(views.errors["404"]({
            'title': '404 Not Found',
            'isSignedIn': req.session.user
        }));
    }
});

communityRouter.post('/do-post-list-exist', (req, res) => {
    const postListCount = req.body.postList;
    const postList = new PostList();

    if (!isNaN(parseInt(postListCount))) {
        postList
            .read(postListCount)
            .then(() => {
                res.send('ok');
            }, () => {
                res.send('no-list');
            }).catch(error => {
                log('error', error.toString());

                res.send('error');
            })
    } else {
        res.send('number-format-not-match');
    }
});

communityRouter.get('/read-post/:postId', (req, res) => {
    const postId = req.params.postId;
    const post = new Post();

    if (!isNaN(parseInt(postId))) {
        post
            .getTitle(postId)
            .then(title => {
                if (req.session.user) {
                    post
                        .getAuthorId(postId)
                        .then(id => {
                            res.end(views.community.readPost({
                                title: title,
                                isSignedIn: req.session.user,
                                postId: postId,
                                owner: req.session.user && req.session.user.index === id
                            }));
                        }
                    );
                } else {
                    res.end(views.community.readPost({
                        title: title,
                        isSignedIn: req.session.user,
                        postId: postId
                    }));
                }
            }, reason => {
                res.end(views.errors["404"]({
                    'title': '404 Not Found',
                    'isSignedIn': req.session.user
                }));
            }).catch(error => {
                log('error', error.toString());

                res.end(views.errors["500"]({
                    title: '500 Internal Server Error',
                    isSignedIn: !!req.session.user
                }));
            }
        );
    } else {
        res.end(views.errors["404"]({
            'title': '404 Not Found',
            'isSignedIn': req.session.user
        }));
    }
});

communityRouter.post('/get-post', (req, res) => {
    const postId = req.body.postId;
    const userPassword = req.body.password;
    const needComments = req.body.needComments;
    const increaseViews = req.body.increaseViews;
    const post = new Post();
    const commentList = new CommentList(postId);
    const __community = __('community');

    post
        .getPassword(postId)
        .then(dbPassword => {
            if (dbPassword === new Sha512(userPassword).getEncrypted()) {
                post
                    .read(postId)
                    .then(postContents => {
                        if (increaseViews) {
                            post
                                .increaseViews(postId)
                                .then(() => {
                                }).catch(error => {
                                    log('error', error.toString());
                                }
                            );
                        }

                        if (needComments) {
                            commentList
                                .read()
                                .then(comments => {
                                    let plainComments = comments;

                                    Promise.all([...Array(plainComments.length).keys()].map(i => {
                                        return new Promise(resolve => {
                                            let decryptedNickname = new Aes256(plainComments[i].nickname, 'encrypted').getPlain();

                                            plainComments[i].nickname = decryptedNickname;

                                            if (req.session && req.session.user) {
                                                // if current user is the owner of the comment
                                                if (req.session.user.id === decryptedNickname) {
                                                    plainComments[i].userPermission = 'writer';

                                                    resolve();
                                                } else {
                                                    const tempPost = new Post();
                                                    tempPost
                                                        .getAuthorId(postId)
                                                        .then(authorId => {
                                                            if (authorId === req.session.user.index) {
                                                                plainComments[i].userPermission = 'postOwner';

                                                                resolve();
                                                            } else {
                                                                if (plainComments[i].isPrivate) {
                                                                    plainComments[i].content = `
                                                                    <div>
                                                                        <i class="material-icons">
                                                                            lock
                                                                        </i>
                                                                        ${__community.readPost.comment.isPrivate}
                                                                    </div>
                                                                `;
                                                                }

                                                                plainComments[i].userPermission = 'none';

                                                                resolve();
                                                            }
                                                        }).catch(error => {
                                                            throw error;
                                                        }
                                                    );
                                                }
                                            } else {
                                                if (plainComments[i].isPrivate) {
                                                    plainComments[i].content = `
                                                    <div>
                                                        <i class="material-icons">
                                                            lock
                                                        </i>
                                                        ${__community.readPost.comment.isPrivate}
                                                    </div>
                                                `;
                                                }

                                                plainComments[i].userPermission = 'none';

                                                resolve();
                                            }
                                        });
                                    })).then(() => {
                                        res.send({
                                            result: 'right',
                                            data: {
                                                title: postContents.title,
                                                nickname: new Aes256(postContents.nickname, 'encrypted').getPlain(),
                                                date: postContents.date,
                                                content: postContents.content,
                                                isModified: postContents.isModified,
                                                views: postContents.views,
                                                comments: plainComments
                                            }
                                        });
                                    }).catch(error => {
                                        log('error', error.toString());

                                        res.send({
                                            result: 'error'
                                        });
                                    })
                                }).catch(error => {
                                    log('error', error.toString());

                                    res.send('error');
                                }
                            );
                        } else {
                            res.send({
                                result: 'right',
                                data: {
                                    title: postContents.title,
                                    nickname: new Aes256(postContents.nickname, 'encrypted').getPlain(),
                                    date: postContents.date,
                                    content: postContents.content,
                                    isModified: postContents.isModified,
                                    views: postContents.views
                                }
                            });
                        }
                    }, reason => {
                        res.send({
                            result: 'no-post'
                        });
                    }).catch(error => {
                        log('error', error.toString());

                        res.send({
                            result: 'error'
                        });
                    }
                );
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
            log('error', error.toString());

            res.send({
                result: 'error'
            });
        }
    );
});

communityRouter.get('/new-post', (req, res) => {
    const __community = __('community');

    res.end(views.community.newPost({
        title: __community.newPost.title,
        isSignedIn: !!req.session.user
    }));
});

communityRouter.post('/create-post', (req, res) => {
    const title = req.body.title;
    const password = req.body.password;
    const content = req.body.content;
    const post = new Post();

    if (req.session.user) {
        if (title.length === 0) {
            res.send('empty-title');
        } else if (content.replace(/<.*?>/g, '').length === 0) {
            res.send('empty-content');
        } else {
            post
                .create(req.session.user.index, title, password, content)
                .then(() => {
                    res.send('ok');
                }).catch(error => {
                    log('error', error.toString());

                    res.send('error');
                }
            );
        }
    } else {
        res.send('not-signed-in');
    }
});

communityRouter.get('/fix-post/:postId', (req, res) => {
    const postId = req.params.postId;
    const post = new Post();
    const __community = __('community');

    if (!isNaN(parseInt(postId))) {
        post
            .getTitle(postId)
            .then(title => {
                if (req.session.user) {
                    post
                        .getAuthorId(postId)
                        .then(authorId => {
                            if (authorId === req.session.user.index) {
                                res.end(views.community.fixPost({
                                    title: __community.fixPost.title,
                                    isSignedIn: req.session.user,
                                    postId: postId,
                                    owner: true
                                }));
                            } else {
                                res.end(views.errors["403"]({
                                    title: '403 Forbidden',
                                    isSignedIn: !!req.session.user
                                }));
                            }
                        }
                    );
                } else {
                    res.end(views.errors["403"]({
                        title: '403 Forbidden',
                        isSignedIn: !!req.session.user
                    }));
                }
            }, reason => {
                res.end(views.errors["404"]({
                    'title': '404 Not Found',
                    'isSignedIn': req.session.user
                }));
            }).catch(error => {
                log('error', error.toString());

                res.end(views.errors["500"]({
                    title: '500 Internal Server Error',
                    isSignedIn: !!req.session.user
                }));
            }
        );
    } else {
        res.end(views.errors["404"]({
            'title': '404 Not Found',
            'isSignedIn': req.session.user
        }));
    }
});

communityRouter.post('/update-post', (req, res) => {
    const title = req.body.title;
    const originalPassword = req.body.originalPassword;
    const password = req.body.password;
    const content = req.body.content;
    const postId = req.body.postId;
    const post = new Post();

    if (req.session.user) {
        if (title.length === 0) {
            res.send('empty-title');
        } else if (content.replace(/<.*?>/g, '').length === 0) {
            res.send('empty-content');
        } else {
            post
                .update(postId, req.session.user.index, title, originalPassword, password, content)
                .then(() => {
                    res.send('ok');
                }, reason => {
                    switch (reason) {
                        case 'no-row': res.send('no-post'); break;
                        case 'invalid-user': res.send('invalid-user'); break;
                    }
                }).catch(error => {
                    log('error', error.toString());

                    res.send('error');
                }
            );
        }
    } else {
        res.send('not-signed-in');
    }
});

communityRouter.post('/delete-post', (req, res) => {
    const postId = req.body.postId;
    const password = req.body.password;
    const post = new Post();

    if (req.session.user) {
        post
            .delete(postId, req.session.user.index, password)
            .then(() => {
                res.send('ok');
            }, reason => {
                res.send(reason);
            }).catch(error => {
                log('error', error.toString());

                res.send('error');
            }
        );
    } else {
        res.send('not-signed-in');
    }
});

communityRouter.post('/create-comment', (req, res) => {
    const content = req.body.content;
    const isPrivateComment = req.body.isPrivateComment;
    const postId = req.body.postId;
    const comment = new Comment();

    if (req.session.user) {
        if (content.replace(/<.*?>/g, '').length === 0) {
            res.send('empty-content')
        } else {
            comment
                .create(req.session.user.index, postId, content, isPrivateComment)
                .then(() => {
                    res.send('ok');
                }).catch(() => {
                    res.send('error');
                }
            );
        }
    } else {
        res.send('not-signed-in');
    }
});

communityRouter.post('/update-comment', (req, res) => {
    const commentId = req.body.commentId;
    const content = req.body.content;
    const isPrivate = req.body.isPrivate;
    const comment = new Comment();

    if (req.session.user) {
        comment
            .update(req.session.user.index, commentId, content, isPrivate)
            .then(() => {
                res.send('ok');
            }, reason => {
                res.send(reason);
            }).catch(error => {
                log('error', error.toString());

                res.send('error');
            }
        );
    } else {
        res.send('not-signed-in');
    }
});

communityRouter.post('/delete-comment', (req, res) => {
    const comment = new Comment();
    const commentId = req.body.commentId;

    if (req.session.user) {
        comment
            .delete(req.session.user.index, commentId)
            .then(() => {
                res.send('ok');
            }, reason => {
                res.send(reason);
            }).catch(error => {
                log('error', error.toString());

                res.send('error');
            }
        );
    } else {
        res.send('not-signed-in');
    }
});

communityRouter.get('/*', (req, res) => {
    res.end(views.errors["404"]({
        'title': '404 Not Found',
        'isSignedIn': req.session.user
    }));
});

module.exports = {
    router: communityRouter
};
