function encryptPassword(value) {
    const sha512 = require('js-sha512').sha512;
    const salt = 'Pi8aUIiYEatjDjCR4C6$Tr4pHA2RVjAVof6vETt1I6jQu7D8o@wzAnAPy3udk2RT9ns1kjVVRJB^U3GVGR6m$54qeRljjH&1kNn';

    return sha512(salt + value);
}
