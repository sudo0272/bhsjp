const mysql = require('mysql');
const getMysqlConnectionData = require('../models/getMysqlConnectionData').getMysqlConnectionData;
const connection = mysql.createConnection(getMysqlConnectionData());
const escapeHtml = require('escape-html');
const Aes256 = require('../lib/Aes256');

function doIdExist(id) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT COUNT(1) FROM accounts WHERE `id`=?', [
            new Aes256(escapeHtml(id), 'plain').getEncrypted()
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
