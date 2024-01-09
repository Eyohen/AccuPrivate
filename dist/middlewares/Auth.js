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
exports.validateApiKey = exports.basicAuth = void 0;
const Token_1 = require("../utils/Auth/Token");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Constants_1 = require("../utils/Constants");
const Errors_1 = require("../utils/Errors");
const Cypher_1 = __importDefault(require("../utils/Cypher"));
const basicAuth = function (tokenType) {
    return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        const authHeader = req.headers.authorization;
        if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer')))
            return next(new Error('Invalid authorization header'));
        const jwtToken = authHeader.split(' ')[1];
        const payload = jsonwebtoken_1.default.verify(jwtToken, Constants_1.JWT_SECRET);
        const tokenData = payload;
        tokenData.token = jwtToken;
        if (tokenData.misc.tokenType !== tokenType) {
            return next(new Errors_1.UnauthenticatedError('Invalid authentication'));
        }
        const key = `${tokenType}_token:${tokenData.user.entity.id}`;
        const token = yield Token_1.TokenUtil.getTokenFromCache(key);
        if (token !== jwtToken) {
            return next(new Errors_1.UnauthenticatedError('Invalid authentication'));
        }
        req.user = tokenData;
        next();
    });
};
exports.basicAuth = basicAuth;
const validateApiKey = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const apiKey = req.headers['x-api-key'];
    const apiSecret = req.headers['x-api-secret'];
    if (!apiKey) {
        return next(new Errors_1.UnauthenticatedError('Invalid API key'));
    }
    const encryptedSecretForDecodingApiKey = yield Token_1.TokenUtil.getTokenFromCache(apiSecret);
    if (!encryptedSecretForDecodingApiKey) {
        return next(new Errors_1.UnauthenticatedError('Invalid API Secret'));
    }
    const decryptedEncryptedSecretForDecodingApiKey = Cypher_1.default.decryptString(encryptedSecretForDecodingApiKey).replace(/"/g, '');
    const validApiKey = Cypher_1.default.decodeApiKey(apiKey, decryptedEncryptedSecretForDecodingApiKey);
    if (!validApiKey) {
        return next(new Errors_1.UnauthenticatedError('Invalid API key'));
    }
    ;
    req.key = validApiKey;
    // Check if this si the current active api key
    const currentActiveApiKey = yield Token_1.TokenUtil.getTokenFromCache(`active_api_key:${validApiKey}`);
    console.log({
        validApiKey,
        currentActiveApiKey
    });
    if (!currentActiveApiKey) {
        return next(new Errors_1.UnauthenticatedError('Invalid API key'));
    }
    // console.log(currentActiveApiKey)
    // TODO: Disallow api key if user is not yet active
    if (Cypher_1.default.decryptString(currentActiveApiKey) !== apiKey) {
        return next(new Errors_1.UnauthenticatedError('Invalid API key'));
    }
    next();
});
exports.validateApiKey = validateApiKey;
