import express from 'express';

const PORT: number = 80;

const app = express();

app.set('view engine', 'pug');

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index', {title: 'Welcome to By Hong SeJung Project'});
});

app.listen(PORT, () => {
    console.log('Server running on', PORT);
});
