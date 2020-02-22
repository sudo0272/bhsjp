const mysql = require('mysql');
const getMysqlConnectionData = require('../models/getMysqlConnectionData').getMysqlConnectionData;
const connection = mysql.createConnection(getMysqlConnectionData());

function getPostTitle(index, callback) {
    connection.query('SELECT `title`\n' +
                            'FROM `posts`\n' +
                            'WHERE `index`=?;', [
        index
    ], (error, result, fields) => {
        if (error) {
            throw error;
        }

        callback(result);
    });
}

module.exports = {
    getPostTitle: getPostTitle
};
