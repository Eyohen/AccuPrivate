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
const TeamMemberProfile_model_1 = __importDefault(require("../../../models/Entity/Profiles/TeamMemberProfile.model"));
const Entity_service_1 = __importDefault(require("../Entity.service"));
const Entity_model_1 = __importDefault(require("../../../models/Entity/Entity.model"));
const Role_model_1 = __importDefault(require("../../../models/Role.model"));
class TeamMemberProfileService {
    static addTeamMemberProfile(teamMember, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const newTeamMember = TeamMemberProfile_model_1.default.build(teamMember);
            const result = transaction ? yield newTeamMember.save({ transaction }) : yield newTeamMember.save();
            return result;
        });
    }
    static viewTeamMembers() {
        return __awaiter(this, void 0, void 0, function* () {
            const teamMembers = yield TeamMemberProfile_model_1.default.findAll();
            return teamMembers;
        });
    }
    static viewSingleTeamMember(uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            const teamMember = yield TeamMemberProfile_model_1.default.findByPk(uuid);
            return teamMember;
        });
    }
    static viewTeamMemberFullProfile(teamMember) {
        return __awaiter(this, void 0, void 0, function* () {
            const entity = yield Entity_model_1.default.findOne({ where: { teamMemberProfileId: teamMember.id }, include: [Role_model_1.default] });
            if (!entity) {
                throw new Error('Entity not found');
            }
            return entity;
        });
    }
    static viewSingleTeamMemberByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const entity = yield Entity_service_1.default.viewSingleEntityByEmail(email);
            if (!entity || !entity.teamMemberProfileId) {
                return null;
            }
            const teamMember = yield TeamMemberProfileService.viewSingleTeamMember(entity.teamMemberProfileId);
            return teamMember;
        });
    }
    static viewTeamMembersWithCustomQuery(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const teamMembers = yield TeamMemberProfile_model_1.default.findAll(query);
            return teamMembers;
        });
    }
}
exports.default = TeamMemberProfileService;
