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
const Errors_1 = require("../../utils/Errors");
const Partner_service_1 = __importDefault(require("../../services/Partner.service"));
const token_1 = require("../../utils/Auth/token");
const ApiKey_service_1 = __importDefault(require("../../services/ApiKey.service "));
const Cypher_1 = __importDefault(require("../../utils/Cypher"));
class ApiController {
    static getActiveAPIKey(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { partner } = req.user;
            const partner_ = yield Partner_service_1.default.viewSinglePartnerByEmail(partner.email);
            if (!partner_) {
                throw new Errors_1.InternalServerError('Authenticated partner not found');
            }
            const apiKey = yield ApiKey_service_1.default.viewActiveApiKeyByPartnerId(partner.id);
            if (!apiKey) {
                throw new Errors_1.BadRequestError('API Key not found');
            }
            const secKeyInCache = Cypher_1.default.encryptString(partner_.sec);
            yield token_1.TokenUtil.saveTokenToCache({ key: secKeyInCache, token: Cypher_1.default.encryptString(partner_.key) });
            res.status(200).json({
                status: 'success',
                message: 'API Keys retrieved successfully',
                data: {
                    apiKey: apiKey.key,
                    secretKey: secKeyInCache
                }
            });
        });
    }
    static generateApiKeys(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = req.user.partner;
            const partner = yield Partner_service_1.default.viewSinglePartnerByEmail(email);
            if (!partner) {
                throw new Errors_1.BadRequestError('Partner not found');
            }
            const { key, sec } = yield Partner_service_1.default.generateKeys(partner);
            const secKeyInCache = Cypher_1.default.encryptString(sec);
            yield token_1.TokenUtil.saveTokenToCache({ key: secKeyInCache, token: Cypher_1.default.encryptString(key) });
            yield ApiKey_service_1.default.setCurrentActiveApiKeyInCache(partner, key);
            res.status(200).json({
                status: 'success',
                message: 'Deactivated partner successfully',
                data: {
                    apiKey: key,
                    secretKey: secKeyInCache
                }
            });
        });
    }
}
exports.default = ApiController;
