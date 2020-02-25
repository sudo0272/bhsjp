const mysql = require('mysql');
const jsStringEscape = require('js-string-escape');
const getMysqlConnectionData = require('../models/getMysqlConnectionData').getMysqlConnectionData;
const connection = mysql.createConnection(getMysqlConnectionData());
const encryptAes256 = require('../models/encryptAes256').encryptAes256;

function isUserPostOwner(userId, postId) {
    return new Promise(resolve => {
        connection.query("SELECT COUNT(1) count\n" +
                            "    FROM `posts`\n" +
                            "    WHERE `author`=(\n" +
                            "        SELECT `index`\n" +
                            "            FROM `accounts`\n" +
                            "            WHERE `id`=?\n" +
                            "    ) AND `index`=?;", [
            encryptAes256(userId),
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
