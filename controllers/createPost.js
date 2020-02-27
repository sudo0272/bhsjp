const mysql = require('mysql');
const escapeHtml = require('escape-html');
const getMysqlConnectionData = require('../models/getMysqlConnectionData').getMysqlConnectionData;
const connection = mysql.createConnection(getMysqlConnectionData());
const encryptAes256 = require('../models/encryptAes256').encryptAes256;
const encryptSha512 = require('../models/encryptSha512').encryptSha512;
const filterHtml = require('../lib/filterHtml').filterHtml;

function createPost(userId, title, password, content) {
    console.log(userId, title, password, content);
    return new Promise(resolve => {
        connection.query("INSERT INTO `posts`\n" +
                            "    (`author`, `title`, `content`, `password`, `date`)\n" +
                            "    VALUES ((\n" +
                            "        SELECT `index`\n" +
                            "            FROM `accounts`\n" +
                            "            WHERE `id`=?\n" +
                            "    ), ?, ?, ?, NOW());", [
            encryptAes256(userId),
            escapeHtml(title),
            filterHtml(content),
            password === null ? null : encryptSha512(password)
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
