"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_subdomain_1 = __importDefault(require("express-subdomain"));
const routes = {
    introduce: require('./routes/introduce').router
};
const PORT = 80;
const app = express_1.default();
app.set('view engine', 'pug');
app.use(express_1.default.static('public'));
app.use(express_subdomain_1.default('introduce', routes.introduce));
app.get('/', (req, res) => {
    res.render('index', { title: 'Welcome to By Hong SeJung Project' });
});
app.listen(PORT, () => {
    console.log('Server running on', PORT);
});
