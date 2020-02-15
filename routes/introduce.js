const express = require('express');
const expressSession = require('express-session');
const getSessionData = require('../models/getSessionData').getSessionData;

const introduceRouter = express.Router();

introduceRouter.use(expressSession(getSessionData()));

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
