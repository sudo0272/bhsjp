const express = require('express');
const bodyParser = require('body-parser');
const subdomain = require('express-subdomain');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const expressSession = require('express-session');
const RedisStore = require('connect-redis')(expressSession);
const RedisData = require('./models/RedisData');
const SessionData = require('./models/SessionData');
const redisClient = new RedisData().getClient();
const morgan = require('morgan');
const i18n = require('i18n');
const cookieParser = require('cookie-parser');
const I18nData = require('./models/I18nData');
const i18nData = new I18nData();

const routes = {
    introduce: require('./routes/introduce').router,
    accounts: require('./routes/accounts').router,
    community: require('./routes/community').router
};

const certificationDataPath = 'certbot/config/live/bhsjp.kro.kr/';

const certificationData = {
    key:  fs.readFileSync(path.join(__dirname, certificationDataPath, 'privkey.pem'), 'utf8'),
    cert: fs.readFileSync(path.join(__dirname, certificationDataPath, 'cert.pem'),    'utf8'),
    ca:   fs.readFileSync(path.join(__dirname, certificationDataPath, 'chain.pem'),   'utf8')
};

const HTTP_PORT = 80;
const HTTPS_PORT = 443;

const sessionData = new SessionData();

const app = express();

app.set('view engine', 'pug');

app.use(express.static('public'));
app.use(subdomain('introduce.bhsjp', routes.introduce));
app.use(subdomain('accounts.bhsjp', routes.accounts));
app.use(subdomain('community.bhsjp', routes.community));

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());
app.use(bodyParser.raw());

app.use(expressSession({
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

app.use(morgan(':remote-addr - :remote-user [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'));

morgan.token('remote-user', (req, res) => {
    return (req.session && req.session.user) ? req.session.user.id : '-';
});

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
});

app.use(cookieParser());

i18n.configure({
    locales:       i18nData.getLocales(),
    defaultLocale: i18nData.getDefaultLocale(),
    cookie:        i18nData.getCookieName(),
    directory:     i18nData.getDirectoryPath(),
    updateFiles:   i18nData.getUpdateFiles(),
    register:      i18nData.getRegister()
});

app.use(i18n.init);

app.get('/', (req, res) => {
    res.render('index', {
        title: __('index').title,
        isSignedIn: !!req.session.user
    });
});

app.get('/*', (req, res) => {
    res.render('errors/404', {
        title: '404 Not Found',
        isSignedIn: !!req.session.user
    });
});

const httpsServer = https.createServer(certificationData, app);
const httpServer = http.createServer((req, res) => {
    res.writeHead(301, {
        Location: `https://${req.headers.host}${req.url}`
    });

    res.end();
});

httpServer.listen(HTTP_PORT, () => {
    console.log('HTTP server running on', HTTP_PORT);
});

httpsServer.listen(HTTPS_PORT, () => {
    console.log('HTTPS server running on', HTTPS_PORT);
});
