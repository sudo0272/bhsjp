function createAccount(id, password, nickname, email) {
    const mysql = require('mysql');
    const jsStringEscape = require('js-string-escape');

    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: getSqlPassword(),
        database: 'bhsjp'
    });

    connection.connect();

    connection.query("INSERT INTO `accounts` (`id`, `password`, `nickname`, `email`) VALUES (?, ?, ?, ?)", [
        jsStringEscape(id),
        jsStringEscape(password),
        jsStringEscape(nickname),
        jsStringEscape(email)
    ], (error, result, fields) => {
            if (error) {
                throw error;
            }
    });

    connection.end();
}
