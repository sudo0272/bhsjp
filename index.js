"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_subdomain_1 = __importDefault(require("express-subdomain"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const https_1 = __importDefault(require("https"));
const routes = {
    introduce: require('./routes/introduce').router
};
const certificationDataPath = 'certbot/config/live/bhsjp.kro.kr/';
const certificationData = {
    key: fs_1.default.readFileSync(path_1.default.join(__dirname, certificationDataPath, 'privkey.pem'), 'utf8'),
    cert: fs_1.default.readFileSync(path_1.default.join(__dirname, certificationDataPath, 'cert.pem'), 'utf8'),
    ca: fs_1.default.readFileSync(path_1.default.join(__dirname, certificationDataPath, 'chain.pem'), 'utf8')
};
const PORT = 443;
const app = express_1.default();
app.set('view engine', 'pug');
app.use(express_1.default.static('public'));
app.use(express_subdomain_1.default('introduce.bhsjp', routes.introduce));
app.get('/', (req, res) => {
    res.render('index', { title: 'Welcome to By Hong SeJung Project' });
});
const server = https_1.default.createServer(certificationData, app);
server.listen(PORT, () => {
    console.log('HTTPS server running on', PORT);
});
