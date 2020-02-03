const PORT = 3000;

const express = require('express');

const app = express();

app.get('/', (req, res) => {
});

app.listen(PORT, () => {
    console.log('Server running on', PORT);
});
