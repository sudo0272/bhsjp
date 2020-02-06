import express from 'express';
import subdomain from 'express-subdomain';
import fs from 'fs'
import path from 'path'
import https from 'https'

const routes = {
    introduce: require('./routes/introduce').router
};

const certificationDataPath = 'certbot/config/live/bhsjp.kro.kr/';

const certificationData = {
    key:  fs.readFileSync(path.join(__dirname, certificationDataPath, 'privkey.pem'), 'utf8'),
    cert: fs.readFileSync(path.join(__dirname, certificationDataPath, 'cert.pem'),    'utf8'),
    ca:   fs.readFileSync(path.join(__dirname, certificationDataPath, 'chain.pem'),   'utf8')
};

const PORT: number = 443;

const app = express();

app.set('view engine', 'pug');

app.use(express.static('public'));
app.use(subdomain('introduce.bhsjp', routes.introduce));

app.get('/', (req: express.Request, res: express.Response) => {
    res.render('index', {title: 'Welcome to By Hong SeJung Project'});
});

const server = https.createServer(certificationData, app);

server.listen(PORT, () => {
    console.log('HTTPS server running on', PORT);
});
