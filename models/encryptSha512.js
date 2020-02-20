const sha512 = require('js-sha512').sha512;
const SALT = 'Pi8aUIiYEatjDjCR4C6$Tr4pHA2RVjAVof6vETt1I6jQu7D8o@wzAnAPy3udk2RT9ns1kjVVRJB^U3GVGR6m$54qeRljjH&1kNn';

function encryptSha512(value) {
    let encrypted = value;

    for (let i = 0; i < 5000; i++) {
        encrypted = sha512(SALT + encrypted);
    }

    return encrypted;
}

module.exports = {
    encryptSha512: encryptSha512
};
