const mysql = require('mysql');
const MysqlData = require('../../models/MysqlData');
const connection = mysql.createConnection(new MysqlData().getConnection());
const escapeHtml = require('escape-html');
const Aes256 = require('../../lib/Aes256');
const Sha512 = require('../../lib/Sha512');
const filterHtml = require('../../lib/filterHtml').filterHtml;

module.exports = class CreatePost {
    constructor(userId, title, password, content) {
        this.userId = userId;
        this.title = title;
        this.password = password;
        this.content = content;
    }

    post() {
        return new Promise(resolve => {
            connection.query(
                "INSERT INTO `posts`\n" +
                "(`author`, `title`, `content`, `password`, `date`, `isModified`)\n" +
                "VALUES ((\n" +
                "    SELECT `index`\n" +
                "        FROM `accounts`\n" +
                "        WHERE `id`=?\n" +
                "), ?, ?, ?, NOW(), FALSE);", [
                    new Aes256(this.userId, 'plain').getEncrypted(),
                    escapeHtml(this.title),
                    filterHtml(this.content),
                    new Sha512(this.password).getEncrypted()
                ], (error, result, fields) => {
                    if (error) {
                        throw error;
                    }

                    resolve();
                }
            );
        });
    }
};