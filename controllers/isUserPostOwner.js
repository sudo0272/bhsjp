const mysql = require('mysql');
const escapeHtml = require('escape-html');
const MysqlData = require('../models/MysqlData');
const connection = mysql.createConnection(new MysqlData().getConnection());
const Aes256 = require('../lib/Aes256');

function isUserPostOwner(userId, postId) {
    return new Promise(resolve => {
        connection.query("SELECT COUNT(1) count\n" +
                            "    FROM `posts`\n" +
                            "    WHERE `author`=(\n" +
                            "        SELECT `index`\n" +
                            "            FROM `accounts`\n" +
                            "            WHERE `id`=?\n" +
                            "    ) AND `index`=?;", [
            new Aes256(userId, 'plain').getEncrypted(),
            postId
        ], (error, result, fields) => {
            if (error) {
                throw error;
            }

            resolve(!!result[0].count);
        });
    });
}

module.exports = {
    isUserPostOwner: isUserPostOwner
};
