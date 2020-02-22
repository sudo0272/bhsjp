const mysql = require('mysql');
const getMysqlConnectionData = require('../models/getMysqlConnectionData').getMysqlConnectionData;
const connection = mysql.createConnection(getMysqlConnectionData());
const postListItemCount = 20;

function getPostList(offset, callback) {
    connection.query("SELECT `posts`.`index`, `posts`.`title`, `posts`.`password`\n" +
                            "FROM `posts`\n" +
                            "LEFT JOIN `accounts`\n" +
                            "ON `posts`.`author`=`accounts`.`index`\n" +
                            "LIMIT ?, ?", [
        offset * postListItemCount,
        postListItemCount
    ], (error, result, fields) => {
        if (error) {
            throw error;
        } else {
            callback(result);
        }
    });
}

module.exports = {
    getPostList: getPostList
};
