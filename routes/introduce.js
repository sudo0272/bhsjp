const express = require('express');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const RedisStore = require('connect-redis')(expressSession);
const RedisData = require('../models/RedisData');
const redisClient = new RedisData().getClient();
const morgan = require('morgan');

const introduceRouter = express.Router();

introduceRouter.use(bodyParser.urlencoded({
    extended: true
}));

introduceRouter.use(bodyParser.json());
introduceRouter.use(bodyParser.raw());

introduceRouter.use(expressSession({
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

introduceRouter.use(morgan(':remote-addr - :remote-user [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'));

morgan.token('remote-user', (req, res) => {
    return req.session.user ? req.session.user.id : '-';
});

introduceRouter.get('/', (req, res) => {
    res.render('introduce/index', {
        title: '소개',
        isSignedIn: !!req.session.user
    });
});

introduceRouter.get('/project', (req, res) => {
    res.render('introduce/project', {
        title: '프로젝트 소개',
        isSignedIn: !!req.session.user
    });
});

introduceRouter.get('/developer', (req, res) => {
    res.render('introduce/developer', {
        title: '개발자 소개',
        isSignedIn: !!req.session.user
    });
});

introduceRouter.get('/*', (req, res) => {
    res.render('errors/404', {
        'title': '404 Not Found',
        isSignedIn: !!req.session.user
    });
});

module.exports = {
    router: introduceRouter
};
