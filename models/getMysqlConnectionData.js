const fs = require('fs');
const mysqlConnectionData = JSON.parse(fs.readFileSync('./mysqlConnectionData.json'));

function getMysqlConnectionData() {
    return mysqlConnectionData;
}

module.exports = {
    getMysqlConnectionData: getMysqlConnectionData
};
