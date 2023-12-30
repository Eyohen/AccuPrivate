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
const ApiKey_model_1 = __importDefault(require("../models/ApiKey.model"));
const Token_1 = require("../utils/Auth/Token");
const Cypher_1 = __importDefault(require("../utils/Cypher"));
// EventService class for handling event-related operations
class ApiKeyService {
    // Method for adding a new event to the database
    static addApiKey(data, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiKey = ApiKey_model_1.default.build(data);
            transaction ? yield apiKey.save({ transaction }) : yield apiKey.save();
            return apiKey;
        });
    }
    static viewSingleApiKey(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiKey = yield ApiKey_model_1.default.findOne({ where: { key: key } });
            return apiKey;
        });
    }
    static viewActiveApiKeyByPartnerId(partnerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiKey = yield ApiKey_model_1.default.findOne({ where: { partnerId: partnerId, active: true } });
            return apiKey;
        });
    }
    static deactivateApiKey(apiKey) {
        return __awaiter(this, void 0, void 0, function* () {
            apiKey.active = false;
            yield apiKey.save();
            return apiKey;
        });
    }
    static viewSingleApiKeyById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiKey = yield ApiKey_model_1.default.findOne({ where: { id: id } });
            return apiKey;
        });
    }
    static viewAllApiKeys() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiKeys = yield ApiKey_model_1.default.findAll();
            return apiKeys;
        });
    }
    static setCurrentActiveApiKeyInCache(partner, key) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Token_1.TokenUtil.saveTokenToCache({ key: `active_api_key:${partner.id}`, token: Cypher_1.default.encryptString(key) });
        });
    }
    static getCurrentActiveApiKeyInCache(partner) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = yield Token_1.TokenUtil.getTokenFromCache(`active_api_key:${partner.id}`);
            return key ? Cypher_1.default.decryptString(key) : null;
        });
    }
}
exports.default = ApiKeyService;
