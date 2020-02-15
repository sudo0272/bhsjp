function doAccountExist(id, password, callback) {
    const mysql = require('mysql');
    const getMysqlConnectionData = require('../models/getMysqlConnectionData').getMysqlConnectionData;
    const connection = mysql.createConnection(getMysqlConnectionData());

    connection.connect();

    connection.query('SELECT COUNT(1) FROM accounts WHERE `id`=? AND `password`=?', [id, password], (error, results, fields) => {
        if (error) {
            throw error;
        }

        connection.end();

        callback(results[0]['COUNT(1)']);
    });
}

module.exports = {
    doAccountExist: doAccountExist
};
