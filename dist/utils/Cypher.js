"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomString = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const Constants_1 = require("./Constants");
const Helper_1 = require("./Helper");
Object.defineProperty(exports, "generateRandomString", { enumerable: true, get: function () { return Helper_1.generateRandomString; } });
class Cypher {
    static hashPassword(password) {
        const salt = bcrypt_1.default.genSaltSync(10);
        return bcrypt_1.default.hashSync(password, salt);
    }
    static comparePassword(password, hash) {
        return bcrypt_1.default.compareSync(password, hash);
    }
    static encryptString(data) {
        const cipher = crypto_1.default.createCipheriv(this.cryptoAlgorithm, this.cryptoPasswordHex, this.cryptoIVHex);
        let encryptedStr = cipher.update(JSON.stringify(data), 'utf8', 'hex');
        encryptedStr += cipher.final('hex');
        return encryptedStr;
    }
    static decryptString(data) {
        const decipher = crypto_1.default.createDecipheriv(this.cryptoAlgorithm, this.cryptoPasswordHex, this.cryptoIVHex);
        let decryptedStr = decipher.update(data, 'hex', 'utf8');
        decryptedStr += decipher.final('utf8');
        return decryptedStr.replace(/"/g, '');
    }
    static generateAPIKey(data, encryptionKey) {
        const apiKey = Cypher.encryptString(data + ':' + encryptionKey);
        return apiKey;
    }
    static decodeApiKey(key, encryptedKey) {
        const secret = this.decryptString(encryptedKey);
        const apiKey = Cypher.decryptString(key);
        const [data, secretKey] = apiKey.split(':');
        const valid = secretKey === secret.split(':')[1];
        return valid ? data : null;
    }
}
Cypher.cryptoIVHex = Buffer.from(Constants_1.CRYPTO_IV, 'hex');
Cypher.cryptoPasswordHex = Buffer.from(Constants_1.CRYPTO_PASSWORD, 'hex');
Cypher.cryptoAlgorithm = 'aes256';
exports.default = Cypher;
