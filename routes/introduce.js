const express = require('express');

const introduceRouter = express.Router();

introduceRouter.get('/', (req, res) => {
    res.render('introduce/index', {
        title: '소개'
    });
});

introduceRouter.get('/project', (req, res) => {
    res.render('introduce/project', {
        title: '프로젝트 소개'
    });
});

introduceRouter.get('/developer', (req, res) => {
    res.render('introduce/developer', {
        title: '개발자 소개'
    });
});

introduceRouter.get('/*', (req, res) => {
    res.render('errors/404', {
        'title': '404 Not Found'
    });
});

module.exports = {
    router: introduceRouter
};
