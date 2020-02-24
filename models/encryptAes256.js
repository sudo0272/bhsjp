const getAes256Key = require('./getAes256Key').getAes256Key;
const getAes256Iv = require('./getAes256Iv').getAes256Iv;
const aesjs = require('aes-js');
const hex64 = require('hex64');

function encryptAes256(text) {
    const originalTextBytes = Buffer.from(text);
    const leftBytes = 16 - (originalTextBytes.byteLength >= 16 ? originalTextBytes.byteLength % 16 : originalTextBytes.byteLength);
    let leftBuffer = Buffer.alloc(leftBytes);
    const textBytes = Buffer.concat([originalTextBytes, leftBuffer.fill(0x00)]);

    const aesCbc = new aesjs.ModeOfOperation.cbc(getAes256Key(), getAes256Iv());
    const encryptedBytes = aesCbc.encrypt(textBytes);

    return hex64.encode(aesjs.utils.hex.fromBytes(encryptedBytes));
}

module.exports = {
    encryptAes256: encryptAes256
};
