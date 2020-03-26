const fs = require('fs');

module.exports =  (type, message) => {
    fs.appendFile(`/var/log/bhsjp/${type}.log`, `${new Date().toISOString()} ${message}\n`, () => {});
};
