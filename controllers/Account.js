const mysql = require('mysql');
const escapeHtml = require('escape-html');
const MysqlData = require('../models/MysqlData');
const connection = mysql.createConnection(new MysqlData().getConnection());
const Sha512 = require('../lib/Sha512');
const Aes256 = require('../lib/Aes256');

module.exports = class Account {
    create(id, password, nickname, email) {
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

    doAccountExist(id, password) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM accounts WHERE `id`=? AND `password`=?', [
                new Aes256(escapeHtml(id), 'plain').getEncrypted(),
                new Sha512(password).getEncrypted()
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

    doIdExist(id) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT COUNT(1) count FROM accounts WHERE `id`=?', [
                new Aes256(escapeHtml(id), 'plain').getEncrypted()
            ], (error, results, fields) => {
                if (error) {
                    throw error;
                }

                if (results[0].count) {
                    resolve('id-not-exist');
                } else {
                    reject('id-exist');
                }
            });
        });
    }
};
