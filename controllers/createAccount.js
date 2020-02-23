const mysql = require('mysql');
const jsStringEscape = require('js-string-escape');
const getMysqlConnectionData = require('../models/getMysqlConnectionData').getMysqlConnectionData;
const connection = mysql.createConnection(getMysqlConnectionData());
const encryptSha512 = require('../models/encryptSha512').encryptSha512;
const encryptAes256 = require('../models/encryptAes256').encryptAes256;

function createAccount(id, password, nickname, email) {
    return new Promise(resolve => {
        connection.query("INSERT INTO `accounts` (`id`, `password`, `nickname`, `email`) VALUES (?, ?, ?, ?)", [
            encryptAes256(jsStringEscape(id)),
            encryptSha512(password),
            encryptAes256(jsStringEscape(nickname)),
            encryptAes256(jsStringEscape(email))
        ], (error, result, fields) => {
            if (error) {
                throw error;
            } else {
                resolve('success');
            }
        });
    });
}

module.exports = {
    createAccount: createAccount
};
