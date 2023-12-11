"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const PartnerProfile_model_1 = __importDefault(require("../../../models/Entity/Profiles/PartnerProfile.model"));
const Cypher_1 = __importStar(require("../../../utils/Cypher"));
const crypto_1 = require("crypto");
const ApiKey_service_1 = __importDefault(require("../../ApiKey.service "));
const Entity_model_1 = __importDefault(require("../../../models/Entity/Entity.model"));
const Entity_service_1 = __importDefault(require("../Entity.service"));
class PartnerProfileService {
    static createKeys(data) {
        const randomString = (0, Cypher_1.generateRandomString)(20);
        const apiKey = Cypher_1.default.generateAPIKey(data, randomString);
        const sec = (0, crypto_1.randomUUID)();
        return {
            key: apiKey,
            sec: sec
        };
    }
    static addPartner(partner, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const { key, sec } = this.createKeys(partner.id);
            const newPartner = PartnerProfile_model_1.default.build(Object.assign(Object.assign({}, partner), { key, sec }));
            const result = transaction ? yield newPartner.save({ transaction }) : yield newPartner.save();
            return result;
        });
    }
    static viewPartners() {
        return __awaiter(this, void 0, void 0, function* () {
            const partners = yield PartnerProfile_model_1.default.findAll();
            return partners;
        });
    }
    static viewSinglePartner(uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            const partner = yield PartnerProfile_model_1.default.findByPk(uuid, {
                include: [Entity_model_1.default]
            });
            return partner;
        });
    }
    static viewSinglePartnerByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const entity = yield Entity_model_1.default.findOne({ where: { email }, include: [PartnerProfile_model_1.default] });
            if (!entity) {
                return null;
            }
            const partner = yield entity.$get('partnerProfile');
            if (!partner) {
                return null;
            }
            return partner;
        });
    }
    static viewPartnersWithCustomQuery(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const partners = yield PartnerProfile_model_1.default.findAll(Object.assign(Object.assign({}, query), { include: [Entity_model_1.default] }));
            return partners;
        });
    }
    static updateProfilePicture(partner, profilePicture) {
        return __awaiter(this, void 0, void 0, function* () {
            const partnerEntity = yield partner.$get('entity');
            if (!partnerEntity) {
                throw new Error('Partner entity not found');
            }
            yield Entity_service_1.default.updateEntity(partnerEntity, { profilePicture });
            // Get updated partner info
            const updatedPartner = yield PartnerProfile_model_1.default.findByPk(partner.id);
            if (!updatedPartner) {
                throw new Error('PartnerProfile not found');
            }
            return updatedPartner;
        });
    }
    static generateKeys(partner) {
        return __awaiter(this, void 0, void 0, function* () {
            const { key, sec } = this.createKeys(partner.id);
            yield PartnerProfile_model_1.default.update({ key, sec }, { where: { id: partner.id } });
            const partnerActiveKey = yield ApiKey_service_1.default.viewActiveApiKeyByPartnerId(partner.id);
            if (partnerActiveKey) {
                yield ApiKey_service_1.default.deactivateApiKey(partnerActiveKey);
            }
            yield ApiKey_service_1.default.addApiKey({
                key,
                partnerId: partner.id,
                active: true,
                id: (0, crypto_1.randomUUID)()
            });
            return { key, sec };
        });
    }
}
exports.default = PartnerProfileService;
