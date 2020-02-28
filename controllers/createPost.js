const mysql = require('mysql');
const escapeHtml = require('escape-html');
const MysqlData = require('../models/MysqlData');
const connection = mysql.createConnection(new MysqlData().getConnection());
const Aes256 = require('../lib/Aes256');
const Sha512 = require('../lib/Sha512');
const filterHtml = require('../lib/filterHtml').filterHtml;

function createPost(userId, title, password, content) {
    return new Promise(resolve => {
        connection.query("INSERT INTO `posts`\n" +
                            "    (`author`, `title`, `content`, `password`, `date`)\n" +
                            "    VALUES ((\n" +
                            "        SELECT `index`\n" +
                            "            FROM `accounts`\n" +
                            "            WHERE `id`=?\n" +
                            "    ), ?, ?, ?, NOW());", [
            new Aes256(userId, 'plain').getEncrypted(),
            escapeHtml(title),
            filterHtml(content),
            password === null ? null : new Sha512(password).getEncrypted()
        ], (error, result, fields) => {
            if (error) {
                throw error;
            }

            resolve();
        });
    });
}

module.exports = {
    createPost: createPost
};
