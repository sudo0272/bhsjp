const mysql = require('mysql');
const MysqlData = require('../../models/MysqlData');
const connection = mysql.createConnection(new MysqlData().getConnection());
const escapeHtml = require('escape-html');
const Sha512 = require('../../lib/Sha512');
const Aes256 = require('../../lib/Sha512');

module.exports = class CheckAccount {
    constructor(userId, userPassword=null) {
        this.userId = userId;
        this.userPassword = userPassword;
    }

    account() {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM accounts WHERE `id`=? AND `password`=?', [
                new Aes256(escapeHtml(this.userId), 'plain').getEncrypted(),
                new Sha512(this.userPassword).getEncrypted()
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

    id() {
        return new Promise((resolve, reject) => {
            connection.query('SELECT COUNT(1) FROM accounts WHERE `id`=?', [
                new Aes256(escapeHtml(this.userId), 'plain').getEncrypted()
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
};
