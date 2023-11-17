"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Auth_1 = require("../middlewares/Auth");
const Interface_1 = require("../utils/Interface");
const TeamMember_controller_1 = __importDefault(require("../controllers/Public/TeamMember.controller"));
const router = express_1.default.Router();
router
    .use((0, Auth_1.basicAuth)('access'))
    .post('/member/new', (0, Interface_1.AuthenticatedController)(TeamMember_controller_1.default.inviteTeamMember))
    .get('/member/', (0, Interface_1.AuthenticatedController)(TeamMember_controller_1.default.getTeamMembers))
    .get('/member/info', (0, Interface_1.AuthenticatedController)(TeamMember_controller_1.default.getTeamMemberInfo));
exports.default = router;
