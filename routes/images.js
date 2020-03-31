const express = require('express');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const RedisStore = require('connect-redis')(expressSession);
const RedisData = require('../models/RedisData');
const SessionData = require('../models/SessionData');
const redisClient = new RedisData().getClient();
const morgan = require('morgan');
const i18n = require('i18n');
const fs = require('fs');
const log = require('../lib/log');
const cookieParser = require('cookie-parser');
const I18nData = require('../models/I18nData');
const i18nData = new I18nData();
const views = require('../models/views');
const path = require('path');

const sessionData = new SessionData();

const imagesRouter = express.Router();

imagesRouter.use(bodyParser.urlencoded({
    extended: true
}));

imagesRouter.use(bodyParser.json());
imagesRouter.use(bodyParser.raw());

imagesRouter.use(expressSession({
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

imagesRouter.use(morgan(':remote-addr - :remote-user [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', {
    stream: fs.createWriteStream('/var/log/bhsjp/access.log', {
        flags: 'a'
    })
}));

morgan.token('remote-user', (req, res) => {
    return (req.session && req.session.user) ? req.session.user.id : '-';
});

imagesRouter.use(cookieParser());

i18n.configure({
    locales:       i18nData.getLocales(),
    defaultLocale: i18nData.getDefaultLocale(),
    cookie:        i18nData.getCookieName(),
    directory:     i18nData.getDirectoryPath(),
    updateFiles:   i18nData.getUpdateFiles(),
    register:      i18nData.getRegister()
});

imagesRouter.use(i18n.init);

imagesRouter.use(express.static(path.join(__dirname, '..', 'public', 'images')));

module.exports = imagesRouter;
