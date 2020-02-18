const mysql = require('mysql');
const getMysqlConnectionData = require('../models/getMysqlConnectionData').getMysqlConnectionData;
const connection = mysql.createConnection(getMysqlConnectionData());
const jsStringEscape = require('js-string-escape');

function doIdExist(id, callback) {
    connection.connect();

    connection.query('SELECT COUNT(1) FROM accounts WHERE `id`=?', [
        jsStringEscape(id)
    ], (error, results, fields) => {
        if (error) {
            throw error;
        }

        connection.end();

        callback(results[0]['COUNT(1)']);
    });
}

module.exports = {
    doIdExist: doIdExist
};
