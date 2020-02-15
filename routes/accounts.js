const express = require('express');
const bodyParser = require('body-parser');
const doIdExist = require('../controllers/doIdExist').doIdExist;
const doAccountExist = require('../controllers/doAccountExist').doAccountExist;
const createAccount = require('../controllers/createAccount').createAccount;

const accountsRouter = express.Router();

accountsRouter.use(bodyParser.urlencoded({
    extended: true
}));

accountsRouter.use(bodyParser.json());
accountsRouter.use(bodyParser.raw());

accountsRouter.get('/', (req, res) => {
    res.render('accounts/index', {
        title: '계정'
    });
});

accountsRouter.get('/sign-in', (req, res) => {
    res.render('accounts/sign-in', {
        title: '로그인'
    });
});

accountsRouter.get('/sign-up', (req, res) => {
    res.render('accounts/sign-up', {
        title: '회원가입'
    });
});

accountsRouter.post('/create-account', (req, res) => {
    const id = req.body.id;
    const password = req.body.password;
    const nickname = req.body.nickname;
    const email = req.body.email;

    if (id === undefined) {
        res.send('no-id');
    } else if (id.length < 1) {
        res.send('id-length-short');
    } else if (id.length > 10) {
        res.send('id-length-long');
    } else if (id.match(/^\w{1,10}$/g) === null) {
        res.send('id-template-not-match');
    } else if (password === undefined) {
        res.send('no-password');
    } else if (password.length < 4) {
        res.send('password-length-short');
    } else if (nickname === undefined) {
        res.send('no-nickname');
    } else if (nickname.length < 1) {
        res.send('nickname-length-short');
    } else if (nickname.length > 10) {
        res.send('nickname-length-long');
    } else if (email === undefined) {
        res.send('no-email');
    } else if (email.length < 3) { // 3: /.@./
        res.send('email-length-short');
    } else if (email.length > 320) {
        res.send('email-length-long');
    } else if (email.match(/^[^@]{1,64}@[^@]{1,255}$/) === null) {
        res.send('email-template-not-match');
    } else {
        doIdExist(id, idExistence => {
            if (idExistence) {
                res.send('id-already-exists');
            } else {
                createAccount(id, password, nickname, email, () => {
                    res.send('ok');
                });
            }
        });
    }
});

accountsRouter.post('/check-account', (req, res) => {
    const id = req.body.id;
    const password = req.body.password;

    if (id === undefined) {
        res.send('no-id');
    } else if (id.length < 1) {
        res.send('id-length-short');
    } else if (id.length > 10) {
        res.send('id-length-long');
    } else if (id.match(/^\w{1,10}$/g) === null) {
        res.send('id-template-not-match');
    } else if (password === undefined) {
        res.send('no-password');
    } else if (password.length < 4) {
        res.send('password-length-short');
    } else {
        doAccountExist(id, password, accountExistence => {
            if (accountExistence) {
                res.send('ok');
            } else {
                res.send('wrong');
            }
        });
    }
});

accountsRouter.get('/sign-out', (req, res) => {
});

accountsRouter.get('/*', (req, res) => {
    res.render('errors/404', {
        'title': '404 Not Found'
    });
});

module.exports = {
    router: accountsRouter
};
