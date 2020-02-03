const PORT = 3000;

const express = require('express');

const app = express();

app.set('view engine', 'pug');

app.get('/', (req, res) => {
});

app.listen(PORT, () => {
    console.log('Server running on', PORT);
});
