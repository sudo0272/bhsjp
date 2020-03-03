const express = require('express');
const bodyParser = require('body-parser');
const subdomain = require('express-subdomain');
const fs = require('fs');
const path = require('path');
const https = require('https');
const expressSession = require('express-session');
const RedisStore = require('connect-redis')(expressSession);
const RedisData = require('./models/RedisData');
const redisClient = new RedisData().getClient();
const morgan = require('morgan');

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

const PORT = 443;

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

app.use(morgan(':remote-addr - :remote-user [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'));

morgan.token('remote-user', (req, res) => {
    return req.session.user ? req.session.user.id : '-';
});

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
});

app.get('/', (req, res) => {
    res.render('index', {
        title: 'BHSJP 대문',
        isSignedIn: !!req.session.user
    });
});

const server = https.createServer(certificationData, app);

server.listen(PORT, () => {
    console.log('HTTPS server running on', PORT);
});
