import express from 'express';

const introduceRouter = express.Router();

introduceRouter.get('/', (req: express.Request, res: express.Response) => {
    res.render('introduce/index', {
        title: 'Introduce'
    });
});

introduceRouter.get('/project', (req: express.Request, res: express.Response) => {
    res.render('introduce/project', {
        title: 'Introducing Project'
    });
});

introduceRouter.get('/developer', (req: express.Request, res: express.Response) => {
    res.render('introduce/developer', {
        title: 'Introducing Developer'
    });
});

introduceRouter.get('/*', (req: express.Request, res: express.Response) => {
    res.render('errors/404');
});

module.exports = {
    router: introduceRouter
};
