const mysql = require('mysql');
const escapeHtml = require('escape-html');
const getMysqlConnectionData = require('../models/getMysqlConnectionData').getMysqlConnectionData;
const connection = mysql.createConnection(getMysqlConnectionData());
const Aes256 = require('../lib/Aes256');
const encryptSha512 = require('../models/encryptSha512').encryptSha512;
const filterHtml = require('../lib/filterHtml').filterHtml;

function createPost(userId, title, password, content) {
    const aes256 = new Aes256();

    return new Promise(resolve => {
        connection.query("INSERT INTO `posts`\n" +
                            "    (`author`, `title`, `content`, `password`, `date`)\n" +
                            "    VALUES ((\n" +
                            "        SELECT `index`\n" +
                            "            FROM `accounts`\n" +
                            "            WHERE `id`=?\n" +
                            "    ), ?, ?, ?, NOW());", [
            aes256.encrypt(userId),
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
