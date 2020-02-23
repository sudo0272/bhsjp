const mysql = require('mysql');
const getMysqlConnectionData = require('../models/getMysqlConnectionData').getMysqlConnectionData;
const connection = mysql.createConnection(getMysqlConnectionData());
const jsStringEscape = require('js-string-escape');
const encryptAes256 = require('../models/encryptAes256').encryptAes256;

function doIdExist(id) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT COUNT(1) FROM accounts WHERE `id`=?', [
            encryptAes256(jsStringEscape(id))
        ], (error, results, fields) => {
            if (error) {
                throw error;
            }

            if (results[0]['COUNT(1)']) {
                resolve('id-not-exist');
            } else {
                reject('id-exist');
            }
        });
    });
}

module.exports = {
    doIdExist: doIdExist
};
