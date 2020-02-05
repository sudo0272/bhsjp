import express from 'express';
import subdomain from 'express-subdomain';

const routes = {
    introduce: require('./routes/introduce').router
};

const PORT: number = 80;

const app = express();

app.set('view engine', 'pug');

app.use(express.static('public'));
app.use(subdomain('introduce', routes.introduce));

app.get('/', (req: express.Request, res: express.Response) => {
    res.render('index', {title: 'Welcome to By Hong SeJung Project'});
});

app.listen(PORT, () => {
    console.log('Server running on', PORT);
});
