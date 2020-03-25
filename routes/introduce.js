const express = require('express');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const RedisStore = require('connect-redis')(expressSession);
const RedisData = require('../models/RedisData');
const SessionData = require('../models/SessionData');
const redisClient = new RedisData().getClient();
const morgan = require('morgan');
const i18n = require('i18n');
const cookieParser = require('cookie-parser');
const I18nData = require('../models/I18nData');
const i18nData = new I18nData();

const sessionData = new SessionData();

const introduceRouter = express.Router();

introduceRouter.use(bodyParser.urlencoded({
    extended: true
}));

introduceRouter.use(bodyParser.json());
introduceRouter.use(bodyParser.raw());

introduceRouter.use(expressSession({
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

introduceRouter.use(morgan(':remote-addr - :remote-user [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'));

morgan.token('remote-user', (req, res) => {
    return (req.session && req.session.user) ? req.session.user.id : '-';
});

introduceRouter.use(cookieParser());

i18n.configure({
    locales:       i18nData.getLocales(),
    defaultLocale: i18nData.getDefaultLocale(),
    cookie:        i18nData.getCookieName(),
    directory:     i18nData.getDirectoryPath(),
    updateFiles:   i18nData.getUpdateFiles(),
    register:      i18nData.getRegister()
});

introduceRouter.use(i18n.init);

introduceRouter.get('/', (req, res) => {
    res.render('introduce/index', {
        title: __('introduce').title,
        isSignedIn: !!req.session.user
    });
});

introduceRouter.get('/project', (req, res) => {
    res.render('introduce/project', {
        title: __('introduce').project.title,
        isSignedIn: !!req.session.user
    });
});

introduceRouter.get('/developer', (req, res) => {
    res.render('introduce/developer', {
        title: __('introduce').developer.title,
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
