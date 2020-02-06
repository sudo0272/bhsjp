"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const introduceRouter = express_1.default.Router();
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
    res.render('errors/404');
});
module.exports = {
    router: introduceRouter
};
