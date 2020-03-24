const path = require('path');
const directoryPath = path.join(__dirname, '../', '/locales');

module.exports = class {
    constructor() {}

    getLocales() {
        return [
            'ko',
            'en'
        ];
    }

    getDefaultLocale() {
        return 'ko';
    }

    getCookieName() {
        return 'language';
    }

    getDirectoryPath() {
        return directoryPath;
    }

    getUpdateFiles() {
        return false;
    }

    getRegister() {
        return global;
    }
};