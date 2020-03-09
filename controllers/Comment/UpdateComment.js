const mysql = require('mysql');
const MysqlData = require('../../models/MysqlData');
const connection = mysql.createConnection(new MysqlData().getConnection());
const escapeHtml = require('escape-html');
const Aes256 = require('../../lib/Aes256');
const Sha512 = require('../../lib/Sha512');
const filterHtml = require('../../lib/filterHtml').filterHtml;

module.exports = class UpdateComment {
    constructor(userIndex, commentId, content, isPrivate) {
        this.userIndex = userIndex;
        this.commentId = commentId;
        this.content = content;
        this.isPrivate = isPrivate;
    }

    update() {
        return new Promise((resolve, reject) => {
            connection.query("SELECT author\n" +
                "    FROM comments\n" +
                "    WHERE `index`=?;", [
                this.commentId
            ], (error, result, fields) => {
                if (error) {
                    throw error;
                }

                if (result.length > 0) {
                    if (result[0].author === parseInt(this.userIndex)) {
                        connection.query("UPDATE comments\n" +
                            "    SET\n" +
                            "        content=?,\n" +
                            "        date=NOW(),\n" +
                            "        `isPrivate`=?,\n" +
                            "        `isModified`=TRUE\n" +
                            "    WHERE `index`=?;", [
                            filterHtml(this.content),
                            this.isPrivate,
                            this.commentId
                        ], (error, result, fields) => {
                            if (error) {
                                throw error;
                            }

                            resolve();
                        });
                    } else {
                        reject('invalid-user');
                    }
                } else {
                    reject('no-comment')
                }
            });
        });
    }
};