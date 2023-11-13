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
exports.basicAuth = void 0;
const token_1 = require("../utils/Auth/token");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Constants_1 = require("../utils/Constants");
const Errors_1 = require("../utils/Errors");
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
        const key = `${tokenType}_token:${tokenData.partner.id}`;
        const token = yield token_1.TokenUtil.getTokenFromCache(key);
        if (token !== jwtToken) {
            return next(new Errors_1.UnauthenticatedError('Invalid authentication'));
        }
        req.user = tokenData;
        next();
    });
};
exports.basicAuth = basicAuth;
