const mysql = require('mysql');
const escapeHtml = require('escape-html');
const getMysqlConnectionData = require('../models/getMysqlConnectionData').getMysqlConnectionData;
const connection = mysql.createConnection(getMysqlConnectionData());
const Sha512 = require('../lib/Sha512');
const Aes256 = require('../lib/Aes256');

function createAccount(id, password, nickname, email) {
    return new Promise(resolve => {
        connection.query("INSERT INTO `accounts` (`id`, `password`, `nickname`, `email`) VALUES (?, ?, ?, ?)", [
            new Aes256(escapeHtml(id), 'plain').getEncrypted(),
            new Sha512(password).getEncrypted(),
            new Aes256(escapeHtml(nickname), 'plain').getEncrypted(),
            new Aes256(escapeHtml(email), 'plain').getEncrypted()
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
