const mysql = require('mysql');
const escapeHtml = require('escape-html');
const MysqlData = require('../../models/MysqlData');
const connection = mysql.createConnection(new MysqlData().getConnection());
const Sha512 = require('../../lib/Sha512');
const Aes256 = require('../../lib/Aes256');

module.exports = class CreateAccount {
    constructor(id, password, nickname, email) {
        this.id = id;
        this.password = password;
        this.nickname = nickname;
        this.email = email;
    }

    create() {
        return new Promise(resolve => {
            connection.query("INSERT INTO `accounts` (`id`, `password`, `nickname`, `email`) VALUES (?, ?, ?, ?)", [
                new Aes256(escapeHtml(this.id), 'plain').getEncrypted(),
                new Sha512(this.password).getEncrypted(),
                new Aes256(escapeHtml(this.nickname), 'plain').getEncrypted(),
                new Aes256(escapeHtml(this.email), 'plain').getEncrypted()
            ], (error, result, fields) => {
                if (error) {
                    throw error;
                } else {
                    resolve('success');
                }
            });
        });
    }
};
