const express = require('express');

const introduceRouter = express.Router();

introduceRouter.get('/', (req, res) => {
    res.render('introduce/index', {
        title: 'Introduce'
    });
});

introduceRouter.get('/project', (req, res) => {
    res.render('introduce/project', {
        title: 'Introducing Project'
    });
});

introduceRouter.get('/developer', (req, res) => {
    res.render('introduce/developer', {
        title: 'Introducing Developer'
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
