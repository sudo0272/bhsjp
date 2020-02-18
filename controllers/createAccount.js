const mysql = require('mysql');
const jsStringEscape = require('js-string-escape');
const getMysqlConnectionData = require('../models/getMysqlConnectionData').getMysqlConnectionData;
const connection = mysql.createConnection(getMysqlConnectionData());
const sha512 = require('js-sha512').sha512;
const getSha512Salt = require('../models/getSha512Salt').getSha512Salt;

function createAccount(id, password, nickname, email, callback) {
    connection.connect();

    connection.query("INSERT INTO `accounts` (`id`, `password`, `nickname`, `email`) VALUES (?, ?, ?, ?)", [
        jsStringEscape(id),
        sha512(getSha512Salt() + jsStringEscape(password)),
        jsStringEscape(nickname),
        jsStringEscape(email)
    ], (error, result, fields) => {
            if (error) {
                throw error;
            } else {
                callback();
            }
    });

    connection.end();
}

module.exports = {
    createAccount: createAccount
};
