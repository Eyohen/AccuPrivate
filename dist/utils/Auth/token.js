"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenUtil = exports.AuthUtil = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Constants_1 = require("../Constants");
const models_1 = require("../../models");
class TokenUtil {
    static encodeToken(payload, expiry) {
        return __awaiter(this, void 0, void 0, function* () {
            return jsonwebtoken_1.default.sign(payload, Constants_1.ENCRYPTION_KEY, { expiresIn: expiry });
        });
    }
    static decodeToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            return jsonwebtoken_1.default.verify(token, Constants_1.ENCRYPTION_KEY);
        });
    }
    static saveTokenToCache({ key, token, expiry }) {
        const response = expiry ? models_1.redisClient.setex(key, expiry, token) : models_1.redisClient.set(key, token);
        return response;
    }
    static getTokenFromCache(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = models_1.redisClient.get(key);
            return token;
        });
    }
    static compareToken(key, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const _token = yield TokenUtil.getTokenFromCache(key);
            return _token === token;
        });
    }
    static deleteTokenFromCache(key) {
        return __awaiter(this, void 0, void 0, function* () {
            yield models_1.redisClient.del(key);
        });
    }
}
exports.TokenUtil = TokenUtil;
class AuthUtil {
    static generateToken(info) {
        return __awaiter(this, void 0, void 0, function* () {
            const { type, partner, expiry, misc } = info;
            const tokenKey = `${type}_token:${partner.id}`;
            const token = jsonwebtoken_1.default.sign({ partner, misc: Object.assign(Object.assign({}, misc), { tokenType: type }) }, Constants_1.JWT_SECRET, { expiresIn: info.expiry });
            yield TokenUtil.saveTokenToCache({ key: tokenKey, token, expiry });
            return token;
        });
    }
    static generateCode(info) {
        return __awaiter(this, void 0, void 0, function* () {
            const { type, partner, expiry, misc } = info;
            const tokenKey = `${type}_code:${partner.id}`;
            const token = Math.floor(100000 + Math.random() * 900000).toString();
            yield TokenUtil.saveTokenToCache({ key: tokenKey, token, expiry });
            return token;
        });
    }
    static compareToken({ partner, tokenType, token }) {
        const tokenKey = `${tokenType}_token:${partner.id}`;
        return TokenUtil.compareToken(tokenKey, token);
    }
    static compareCode({ partner, tokenType, token }) {
        const tokenKey = `${tokenType}_code:${partner.id}`;
        return TokenUtil.compareToken(tokenKey, token);
    }
    static verifyToken(token) {
        return jsonwebtoken_1.default.verify(token, Constants_1.JWT_SECRET);
    }
    static verifyCode(code) {
    }
    static deleteToken({ partner, tokenType, tokenClass }) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenKey = `${tokenType}_${tokenClass}:${partner.id}`;
            yield TokenUtil.deleteTokenFromCache(tokenKey);
        });
    }
}
exports.AuthUtil = AuthUtil;
