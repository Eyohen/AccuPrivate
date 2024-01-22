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
const PartnerProfile_service_1 = __importDefault(require("../../services/Entity/Profiles/PartnerProfile.service"));
const Token_1 = require("../../utils/Auth/Token");
const ApiKey_service_1 = __importDefault(require("../../services/ApiKey.service "));
const Cypher_1 = __importDefault(require("../../utils/Cypher"));
const Profiles_1 = require("../../services/Entity/Profiles");
class ApiController {
    static getActiveAPIKey(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { entity, profile } = req.user.user;
            if (entity.role !== 'PARTNER' && entity.role !== 'TEAMMEMBER') {
                throw new Errors_1.ForbiddenError('Only partners or partner\'s members can access this resource');
            }
            let partner_;
            if (entity.role === 'PARTNER') {
                partner_ = yield PartnerProfile_service_1.default.viewSinglePartnerByEmail(entity.email);
            }
            else {
                console.log(entity.email);
                const teammember_ = yield Profiles_1.TeamMemberProfileService.viewSingleTeamMemberByEmail(entity.email);
                if (!teammember_)
                    throw new Errors_1.InternalServerError('Authenticated teammember not found');
                partner_ = yield PartnerProfile_service_1.default.viewSinglePartner(teammember_.partnerId);
            }
            if (!partner_) {
                throw new Errors_1.InternalServerError('Partner not found');
            }
            const apiKey = yield ApiKey_service_1.default.viewActiveApiKeyByPartnerId(partner_.id);
            if (!apiKey) {
                throw new Errors_1.BadRequestError('API Key not found');
            }
            const secKeyInCache = Cypher_1.default.encryptString(partner_.sec);
            yield Token_1.TokenUtil.saveTokenToCache({ key: secKeyInCache, token: Cypher_1.default.encryptString(partner_.key) });
            res.status(200).json({
                status: 'success',
                message: 'API Keys retrieved successfully',
                data: {
                    apiKey: apiKey.key,
                    secretKey: secKeyInCache,
                    createdAt: apiKey.createdAt,
                    lastUsed: apiKey.lastUsed
                }
            });
        });
    }
    static generateApiKeys(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = req.user.user.entity;
            const partner = yield PartnerProfile_service_1.default.viewSinglePartnerByEmail(email);
            if (!partner) {
                throw new Errors_1.BadRequestError('Partner not found');
            }
            const { key, sec } = yield PartnerProfile_service_1.default.generateKeys(partner);
            const secKeyInCache = Cypher_1.default.encryptString(sec);
            yield Token_1.TokenUtil.saveTokenToCache({ key: secKeyInCache, token: Cypher_1.default.encryptString(key) });
            yield ApiKey_service_1.default.setCurrentActiveApiKeyInCache(partner, key);
            const apiKey = yield ApiKey_service_1.default.viewActiveApiKeyByPartnerId(partner.id);
            if (!apiKey) {
                throw new Errors_1.InternalServerError('API key not found for user');
            }
            res.status(200).json({
                status: 'success',
                message: 'Generated API keys successfully',
                data: {
                    apiKey: key,
                    secretKey: secKeyInCache,
                    createdAt: apiKey.createdAt,
                    lastUsed: apiKey.lastUsed
                }
            });
        });
    }
}
exports.default = ApiController;
