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
const Role_model_1 = __importDefault(require("../../models/Role.model"));
const models_1 = require("../../models");
const TeamMemberProfile_service_1 = __importDefault(require("../../services/Entity/Profiles/TeamMemberProfile.service"));
const Entity_service_1 = __importDefault(require("../../services/Entity/Entity.service"));
const PartnerProfile_service_1 = __importDefault(require("../../services/Entity/Profiles/PartnerProfile.service"));
const Entity_model_1 = __importDefault(require("../../models/Entity/Entity.model"));
const Password_service_1 = __importDefault(require("../../services/Password.service"));
const Email_1 = __importStar(require("../../utils/Email"));
const Role_service_1 = __importDefault(require("../../services/Role.service"));
const Constants_1 = require("../../utils/Constants");
class TeamMemberProfileController {
    static inviteTeamMember(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // The partner is the entity that is inviting the team member
            const { entity: { id }, profile } = req.user.user;
            const { email, name, roleId } = req.body;
            const role = yield Role_service_1.default.viewRoleById(roleId);
            if (!role) {
                throw new Errors_1.BadRequestError('Role not found');
            }
            if (Constants_1.PRIMARY_ROLES.includes(role.name)) {
                throw new Errors_1.BadRequestError('Invalid role');
            }
            const transaction = yield models_1.Database.transaction();
            const teamMemberProfile = yield TeamMemberProfile_service_1.default.addTeamMemberProfile({
                id: (0, uuid_1.v4)(),
                partnerId: profile.id,
                name
            }, transaction);
            const entity = yield Entity_service_1.default.addEntity({
                id: (0, uuid_1.v4)(),
                email: email,
                status: {
                    activated: true,
                    emailVerified: false
                },
                role: role.name,
                teamMemberProfileId: teamMemberProfile.id,
                notificationSettings: {
                    login: false,
                    logout: false,
                    failedTransactions: false
                },
                requireOTPOnLogin: false
            }, transaction);
            const password = (0, uuid_1.v4)();
            const entityPasswrod = yield Password_service_1.default.addPassword({
                id: (0, uuid_1.v4)(),
                password,
                entityId: entity.id
            }, transaction);
            Email_1.default.sendEmail({
                to: email,
                subject: 'Team Invitation',
                html: yield new Email_1.EmailTemplate().inviteTeamMember({ email, password })
            });
            // Commit transaction
            yield transaction.commit();
            // Generate token for team member
            res.status(200).json({
                status: 'success',
                message: 'Team member invited successfully',
                data: {
                    teamMember: Object.assign(Object.assign({}, teamMemberProfile.dataValues), { entity: entity.dataValues }),
                }
            });
        });
    }
    static getTeamMembers(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { entity: { id }, profile } = req.user.user;
            const entity = yield Entity_service_1.default.viewSingleEntity(id);
            if (!entity) {
                throw new Errors_1.BadRequestError('Entity not found');
            }
            const partner = yield PartnerProfile_service_1.default.viewSinglePartner(profile.id);
            if (!partner) {
                throw new Errors_1.BadRequestError('Partner not found');
            }
            const teamMembers = yield TeamMemberProfile_service_1.default.viewTeamMembersWithCustomQuery({
                where: { partnerId: partner.id },
                include: [{ model: Entity_model_1.default, as: 'entity', include: [{ model: Role_model_1.default, as: 'role' }] }]
            });
            res.status(200).json({
                status: 'success',
                message: 'Team members fetched successfully',
                data: {
                    teamMembers: teamMembers
                }
            });
        });
    }
    static getTeamMemberInfo(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { entity: { id } } = req.user.user;
            const { email } = req.query;
            const teamMemberProfile = yield TeamMemberProfile_service_1.default.viewSingleTeamMemberByEmail(email);
            if (!teamMemberProfile) {
                throw new Errors_1.BadRequestError('Team member not found');
            }
            const fullProfile = yield TeamMemberProfile_service_1.default.viewTeamMemberFullProfile(teamMemberProfile);
            if (!fullProfile) {
                throw new Errors_1.BadRequestError('Team member not found');
            }
            res.status(200).json({
                status: 'success',
                message: 'Team members fetched successfully',
                data: {
                    teamMember: Object.assign(Object.assign({}, teamMemberProfile.dataValues), { entity: fullProfile.dataValues })
                }
            });
        });
    }
    static deleteTeamMember(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { profile: { id } } = req.user.user;
            const { email } = req.query;
            const teamMemberProfile = yield TeamMemberProfile_service_1.default.viewSingleTeamMemberByEmail(email);
            if (!teamMemberProfile) {
                throw new Errors_1.BadRequestError('Team member not found');
            }
            // Check if current partner is the owner of the teammember
            const currPartnerIsOwner = teamMemberProfile.partnerId === id;
            if (!currPartnerIsOwner) {
                throw new Errors_1.ForbiddenError("Team member doesn't belong to partner");
            }
            const entity = yield Entity_service_1.default.viewEntityByTeamMemberProfileId(teamMemberProfile.id);
            if (!entity) {
                throw new Errors_1.BadRequestError('Entity not found');
            }
            const transaction = yield models_1.Database.transaction();
            yield Entity_service_1.default.deleteEntity(entity, transaction);
            yield TeamMemberProfile_service_1.default.deleteTeamMember(teamMemberProfile, transaction);
            yield transaction.commit();
            res.status(200).json({
                status: 'success',
                message: 'Team member deleted successfully',
                data: {
                    teamMember: teamMemberProfile
                }
            });
        });
    }
}
exports.default = TeamMemberProfileController;
