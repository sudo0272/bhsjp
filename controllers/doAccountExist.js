const mysql = require('mysql');
const getMysqlConnectionData = require('../models/getMysqlConnectionData').getMysqlConnectionData;
const connection = mysql.createConnection(getMysqlConnectionData());
const escapeHtml = require('escape-html');
const encryptSha512 = require('../models/encryptSha512').encryptSha512;
const encryptAes256 = require('../models/encryptAes256').encryptAes256;

function doAccountExist(id, password) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM accounts WHERE `id`=? AND `password`=?', [
            encryptAes256(escapeHtml(id)),
            encryptSha512(password)
        ], (error, results, fields) => {
            if (error) {
                throw error;
            }

            if (results.length > 0) {
                resolve(results[0]);
            } else {
                reject('account-not-exist');
            }
        });
    });
}

module.exports = {
    doAccountExist: doAccountExist
};
