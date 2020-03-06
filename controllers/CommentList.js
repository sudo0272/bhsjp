const mysql = require('mysql');
const MysqlData = require('../models/MysqlData');
const connection = mysql.createConnection(new MysqlData().getConnection());

module.exports = class CommentList {
    getFromPostId(postId) {
        return new Promise(resolve => {
            connection.query("SELECT a.nickname, c.`index`, c.content, c.date, c.isPrivate, c.isModified\n" +
                "    FROM comments c\n" +
                "    LEFT JOIN accounts a\n" +
                "    ON a.`index`=c.author\n" +
                "    WHERE c.postId=?;", [
                postId
            ], (error, result, fields) => {
                if (error) {
                    throw error;
                }

                resolve(result);
            });
        });
    }
};
