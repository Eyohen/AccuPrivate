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
const uuid_1 = require("uuid");
const Errors_1 = require("../../utils/Errors");
const Role_model_1 = require("../../models/Role.model");
const models_1 = require("../../models");
const Entity_service_1 = __importDefault(require("../../services/Entity/Entity.service"));
const PartnerProfile_service_1 = __importDefault(require("../../services/Entity/Profiles/PartnerProfile.service"));
const Password_service_1 = __importDefault(require("../../services/Password.service"));
const Email_1 = __importStar(require("../../utils/Email"));
const Role_service_1 = __importDefault(require("../../services/Role.service"));
const Cypher_1 = __importDefault(require("../../utils/Cypher"));
const Token_1 = require("../../utils/Auth/Token");
const ApiKey_service_1 = __importDefault(require("../../services/ApiKey.service "));
const ResponseTrimmer_1 = __importDefault(require("../../utils/ResponseTrimmer"));
class TeamMemberProfileController {
    static invitePartner(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // The partner is the entity that is inviting the team member
            const { email } = req.body;
            const role = yield Role_service_1.default.viewRoleByName(Role_model_1.RoleEnum.Partner);
            if (!role) {
                throw new Errors_1.BadRequestError('Role not found');
            }
            const existingPartner = yield PartnerProfile_service_1.default.viewSinglePartnerByEmail(email);
            if (existingPartner) {
                throw new Errors_1.BadRequestError('Email has been used before');
            }
            const transaction = yield models_1.Database.transaction();
            const newPartner = yield PartnerProfile_service_1.default.addPartner({
                id: (0, uuid_1.v4)(),
                email,
            }, transaction);
            const entity = yield Entity_service_1.default.addEntity({
                id: (0, uuid_1.v4)(),
                email,
                status: {
                    activated: false,
                    emailVerified: false
                },
                partnerProfileId: newPartner.id,
                role: Role_model_1.RoleEnum.Partner,
                notificationSettings: {
                    login: true,
                    failedTransactions: true,
                    logout: true
                }
            }, transaction);
            const apiKey = yield ApiKey_service_1.default.addApiKey({
                partnerId: newPartner.id,
                key: newPartner.key,
                active: true,
                id: (0, uuid_1.v4)()
            }, transaction);
            const secKeyInCache = Cypher_1.default.encryptString(newPartner.sec);
            yield Token_1.TokenUtil.saveTokenToCache({ key: secKeyInCache, token: Cypher_1.default.encryptString(newPartner.key) });
            yield ApiKey_service_1.default.setCurrentActiveApiKeyInCache(newPartner, apiKey.key.toString());
            const password = (0, uuid_1.v4)();
            const partnerPassword = yield Password_service_1.default.addPassword({
                id: (0, uuid_1.v4)(),
                entityId: entity.id,
                password,
            }, transaction);
            yield entity.update({ status: Object.assign(Object.assign({}, entity.status), { emailVerified: true }) });
            yield Email_1.default.sendEmail({
                to: newPartner.email,
                subject: 'Partner invitation',
                html: yield new Email_1.EmailTemplate().invitePartner({ email: newPartner.email, password })
            });
            res.status(200).json({
                status: 'success',
                message: 'Partner invited successfully',
                data: {
                    partner: ResponseTrimmer_1.default.trimPartner(Object.assign(Object.assign({}, newPartner.dataValues), { entity })),
                }
            });
        });
    }
    static getPartnerInfo(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { entity: { id } } = req.user.user;
            const { email } = req.query;
            const partnerProfile = yield PartnerProfile_service_1.default.viewSinglePartnerByEmail(email);
            if (!partnerProfile) {
                throw new Errors_1.BadRequestError('Team member not found');
            }
            const entity = yield partnerProfile.$get('entity');
            if (!entity) {
                throw new Errors_1.BadRequestError('Entity not found');
            }
            res.status(200).json({
                status: 'success',
                message: 'Partner fetched successfully',
                data: {
                    partner: Object.assign(Object.assign({}, partnerProfile.dataValues), { entity: entity.dataValues })
                }
            });
        });
    }
}
exports.default = TeamMemberProfileController;
