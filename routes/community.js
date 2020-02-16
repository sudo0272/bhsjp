const express = require('express');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const RedisStore = require('connect-redis')(expressSession);
const redisClient = require('../models/getRedisClient').getRedisClient();

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

communityRouter.get('/view-posts', (req, res) => {
    // TODO: get data from db and render page
});

communityRouter.get('/read-post', (req, res) => {
    // TODO: check if user has signed in
    // if user has signed in: add comment area
    // else: write `sign in to write comment`
});

communityRouter.get('/write-post', (req, res) => {
    // TODO: check if user has signed in and what the user wants; create post or update post, and render page
});

communityRouter.post('/create-post', (req, res) => {
    // TODO: check if user has signed in and add post to db
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
