const mysql = require('mysql');
const MysqlData = require('../models/MysqlData');
const connection = mysql.createConnection(new MysqlData().getConnection());
const escapeHtml = require('escape-html');
const Aes256 = require('../lib/Aes256');
const Sha512 = require('../lib/Sha512');
const filterHtml = require('../lib/filterHtml').filterHtml;

module.exports = class Post {
    constructor() {}

    create(userIndex, title, password, content) {
        return new Promise(resolve => {
            connection.query(
                "INSERT INTO `posts`\n" +
                "(`author`, `title`, `content`, `password`, `date`, `isModified`, `views`)\n" +
                "VALUES (?, ?, ?, ?, NOW(), FALSE, 0);", [
                    userIndex,
                    escapeHtml(title),
                    filterHtml(content),
                    new Sha512(password).getEncrypted()
                ], (error, result, fields) => {
                    if (error) {
                        throw error;
                    }

                    resolve();
                }
            );
        });
    }

    read(postId) {
        return new Promise((resolve, reject) => {
            connection.query(
                "SELECT `accounts`.`nickname`, `posts`.`title`, `posts`.`content`, `posts`.`date`, `posts`.`isModified`\n" +
                "FROM `posts`\n" +
                "LEFT JOIN `accounts`\n" +
                "ON `accounts`.`index`=`posts`.`author`\n" +
                "WHERE `posts`.`index`=?;", [
                    postId
                ], (error, result, fields) => {
                    if (error) {
                        throw error;
                    }

                    if (result.length > 0) {
                        resolve(result[0]);
                    } else {
                        reject('no-row');
                    }
                }
            );
        });
    }

    getTitle(postId) {
        return new Promise((resolve, reject) => {
            connection.query(
                'SELECT `title`\n' +
                'FROM `posts`\n' +
                'WHERE `index`=?;', [
                    postId
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

    getPassword(postId) {
        return new Promise((resolve, reject) => {
            connection.query(
                "SELECT `password`\n" +
                "FROM `posts`\n" +
                "WHERE `index`=?;", [
                    postId
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

    getAuthorId(postId) {
        return new Promise((resolve, reject) => {
            connection.query("SELECT author\n" +
                "FROM `posts`\n" +
                "WHERE `index`=?;", [
                postId
            ], (error, result, fields) => {
                if (error) {
                    throw error;
                }

                if (result.length > 0) {
                    resolve(result[0].author);
                } else {
                    reject('no-row');
                }
            });
        });
    }

    update(postId, userIndex, title, originalPassword, password, content) {
        return new Promise((resolve, reject) => {
            connection.query("\n" +
                "SELECT `author`\n" +
                "    FROM posts\n" +
                "    WHERE\n" +
                "        `index`=? AND\n" +
                "        `password`=?;", [
                postId,
                new Sha512(originalPassword).getEncrypted()
            ], (error, accountResult, fields) => {
                if (error) {
                    throw error;
                }

                if (accountResult.length > 0) {
                    if (accountResult[0].author === userIndex) {
                        connection.query(
                            "UPDATE `posts`\n" +
                            "    SET\n" +
                            "        `title`=?,\n" +
                            "        `content`=?,\n" +
                            "        `password`=?,\n" +
                            "        `date`=NOW(),\n" +
                            "        `isModified`=TRUE\n" +
                            "    WHERE `index`=?;", [
                                escapeHtml(title),
                                filterHtml(content),
                                new Sha512(password).getEncrypted(),
                                postId
                            ], (error, result, fields) => {
                                if (error) {
                                    throw error;
                                }

                                resolve();
                            }
                        );
                    } else {
                        reject('invalid-user');
                    }
                } else {
                    reject('no-row');
                }
            });
        });
    }

    delete(postId, userIndex, password) {
        return new Promise((resolve, reject) => {
            connection.query("SELECT `author`\n" +
                "    FROM posts\n" +
                "    WHERE\n" +
                "        `index`=? AND\n" +
                "        `password`=?;", [
                postId,
                new Sha512(password, 'plain').getEncrypted()
            ], (error, accountResult, fields) => {
                if (error) {
                    throw error;
                }

                if (accountResult.length > 0) {
                    if (accountResult[0].author === userIndex) {
                        connection.query(
                            "DELETE\n" +
                            "    FROM `posts`\n" +
                            "    WHERE `index`=?;", [
                                postId
                            ], (error, result, fields) => {
                                if (error) {
                                    throw error;
                                }

                                resolve();
                            }
                        );
                    } else {
                        reject('invalid-user');
                    }
                } else {
                    reject('wrong-password');
                }
            });
        });
    }
};
