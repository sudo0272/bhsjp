const mysql = require('mysql');
const getMysqlConnectionData = require('../models/getMysqlConnectionData').getMysqlConnectionData;
const connection = mysql.createConnection(getMysqlConnectionData());

function getPost(postId) {
    return new Promise((resolve, reject) => {
        connection.query("SELECT `accounts`.`nickname`, `posts`.`date`, `posts`.`content`\n" +
                                "FROM `posts`\n" +
                                "LEFT JOIN `accounts`\n" +
                                "ON `accounts`.`index`=`posts`.`author`\n" +
                                "WHERE `posts`.`index`=40;", [
            postId
        ], (error, result, fields) => {
            if (error) {
                throw error;
            }

            if (result.length > 0) {
                resolve(result);
            } else {
                reject('no-row');
            }
        });
    });
}

module.exports = {
    getPost: getPost
};
