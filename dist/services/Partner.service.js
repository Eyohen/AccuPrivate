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
const Partner_model_1 = __importDefault(require("../models/Partner.model"));
class PartnerService {
    static addPartner(partner, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const newPartner = Partner_model_1.default.build(partner);
            const result = transaction ? yield newPartner.save({ transaction }) : yield newPartner.save();
            return result;
        });
    }
    static viewPartners() {
        return __awaiter(this, void 0, void 0, function* () {
            const partners = yield Partner_model_1.default.findAll();
            return partners;
        });
    }
    static viewSinglePartner(uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            const partner = yield Partner_model_1.default.findByPk(uuid);
            return partner;
        });
    }
    static viewSinglePartnerByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const partner = yield Partner_model_1.default.findOne({ where: { email } });
            return partner;
        });
    }
    static viewPartnersWithCustomQuery(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const partners = yield Partner_model_1.default.findAll(query);
            return partners;
        });
    }
}
exports.default = PartnerService;
