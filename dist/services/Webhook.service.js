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
const Webhook_model_1 = __importDefault(require("../models/Webhook.model"));
const axios_1 = __importDefault(require("axios"));
const ApiKey_service_1 = __importDefault(require("./ApiKey.service "));
const Cypher_1 = __importDefault(require("../utils/Cypher"));
const Profiles_1 = require("./Entity/Profiles");
const Logger_1 = __importDefault(require("../utils/Logger"));
class WebhookService {
    static addWebhook(data, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const webhook = Webhook_model_1.default.build(data);
            transaction ? yield webhook.save({ transaction }) : yield webhook.save();
            return webhook;
        });
    }
    static viewWebhookByPartnerId(partnerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const webhook = yield Webhook_model_1.default.findOne({ where: { partnerId } });
            return webhook;
        });
    }
    static viewWebhookById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const webhook = yield Webhook_model_1.default.findOne({ where: { id } });
            return webhook;
        });
    }
    static viewAllWebhooks() {
        return __awaiter(this, void 0, void 0, function* () {
            const webhooks = yield Webhook_model_1.default.findAll();
            return webhooks;
        });
    }
    static deleteWebhook(webhook) {
        return __awaiter(this, void 0, void 0, function* () {
            yield webhook.destroy();
            return webhook;
        });
    }
    static updateWebhook(webhook, data) {
        return __awaiter(this, void 0, void 0, function* () {
            webhook.url = data.url;
            yield webhook.save();
            return webhook;
        });
    }
    static getHeaders(partnerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiKeyRecord = yield ApiKey_service_1.default.viewActiveApiKeyByPartnerId(partnerId);
            if (!apiKeyRecord) {
                throw new Error('Api key for partner not found');
            }
            const partner = yield Profiles_1.PartnerProfileService.viewSinglePartner(partnerId);
            if (!partner) {
                throw new Error('Partner not found');
            }
            const secretKey = Cypher_1.default.encryptString(partner.sec);
            const headerConfig = {
                'x-api-key': apiKeyRecord.key,
                'x-secret-key': secretKey,
            };
            return headerConfig;
        });
    }
    static sendWebhookNotification(webhook, data) {
        return __awaiter(this, void 0, void 0, function* () {
            Logger_1.default.info(`Sending webhook request for transaction`);
            const headers = yield this.getHeaders(webhook.partnerId);
            if (!webhook.url) {
                throw new Error('Webhook url not found');
            }
            const response = yield axios_1.default.post(webhook.url, data);
            return response.data;
        });
    }
}
exports.default = WebhookService;
