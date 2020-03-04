const mysql = require('mysql');
const MysqlData = require('../models/MysqlData');
const connection = mysql.createConnection(new MysqlData().getConnection());
const escapeHtml = require('escape-html');
const Aes256 = require('../lib/Aes256');
const Sha512 = require('../lib/Sha512');
const filterHtml = require('../lib/filterHtml').filterHtml;

module.exports = class Comment {
    constructor(userIndex, postId, content, isPrivateComment) {
        this.userIndex = userIndex;
        this.postId = postId;
        this.content = content;
        this.isPrivateComment = isPrivateComment;
    }

    create() {
        return new Promise(resolve => {
            connection.query("INSERT INTO comments\n" +
                "    (author, postId, content, isPrivate, isModified)\n" +
                "    VALUES (?, ?, ?, ?, ?);", [
                this.userIndex,
                this.postId,
                filterHtml(this.content),
                this.isPrivateComment,
                false
            ], (error, result, fields) => {
                if (error) {
                    throw error;
                }

                resolve();
            });
        });
    }
};