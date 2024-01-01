"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Auth_1 = require("../middlewares/Auth");
const Partner_controller_1 = __importDefault(require("../controllers/Public/Partner.controller"));
const Interface_1 = require("../utils/Interface");
const router = express_1.default.Router();
router
    .use((0, Auth_1.basicAuth)('access'))
    .get('/info', (0, Interface_1.AuthenticatedController)(Partner_controller_1.default.getPartnerInfo))
    .post('/invite', (0, Interface_1.AuthenticatedController)(Partner_controller_1.default.invitePartner));
exports.default = router;
