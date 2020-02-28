const mysql = require('mysql');
const MysqlData = require('../../models/MysqlData');
const connection = mysql.createConnection(new MysqlData().getConnection());

module.exports = class ReadPost {
    constructor(postId) {
        this.postId = postId;
    }

    post() {
        return new Promise((resolve, reject) => {
            connection.query(
                "SELECT `accounts`.`nickname`, `posts`.`date`, `posts`.`content`\n" +
                "FROM `posts`\n" +
                "LEFT JOIN `accounts`\n" +
                "ON `accounts`.`index`=`posts`.`author`\n" +
                "WHERE `posts`.`index`=?;", [
                    this.postId
                ], (error, result, fields) => {
                    if (error) {
                        throw error;
                    }

                    if (result.length > 0) {
                        resolve(result);
                    } else {
                        reject('no-row');
                    }
                }
            );
        });
    }

    title() {
        return new Promise((resolve, reject) => {
            connection.query(
                'SELECT `title`\n' +
                'FROM `posts`\n' +
                'WHERE `index`=?;', [
                    this.postId
                ], (error, result, fields) => {
                    if (error) {
                        throw error;
                    }

                    if (result.length > 0) {
                        resolve(result[0].title);
                    } else {
                        reject('no-row');
                    }
                }
            );
        });
    }

    password() {
        return new Promise((resolve, reject) => {
            connection.query(
                "SELECT `password`\n" +
                "FROM `posts`\n" +
                "WHERE `index`=?;", [
                    this.postId
                ], (error, result, fields) => {
                    if (error) {
                        throw error;
                    }

                    if (result.length > 0) {
                        resolve(result[0].password);
                    } else {
                        reject('no-row');
                    }
                }
            );
        });
    }
};
