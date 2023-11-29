"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamMemberProfileService = exports.PartnerProfileService = void 0;
const PartnerProfile_service_1 = __importDefault(require("./PartnerProfile.service"));
exports.PartnerProfileService = PartnerProfile_service_1.default;
const TeamMemberProfile_service_1 = __importDefault(require("./TeamMemberProfile.service"));
exports.TeamMemberProfileService = TeamMemberProfile_service_1.default;
