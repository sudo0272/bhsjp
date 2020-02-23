const mysql = require('mysql');
const getMysqlConnectionData = require('../models/getMysqlConnectionData').getMysqlConnectionData;
const connection = mysql.createConnection(getMysqlConnectionData());

function getPostPassword(postId, callback) {
    connection.query("SELECT `password`\n" +
                            "FROM `posts`\n" +
                            "WHERE `index`=?;", [
        postId
    ], (error, result, fields) => {
        if (error) {
            throw error;
        }

        callback(result);
    });
}

module.exports = {
    getPostPassword: getPostPassword
};
