"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ApiKey_controller_1 = __importDefault(require("../../controllers/Public/ApiKey.controller"));
const Auth_1 = require("../../middlewares/Auth");
const router = express_1.default.Router();
router
    .use((0, Auth_1.basicAuth)('access'))
    .get('/active', ApiKey_controller_1.default.getActiveAPIKey)
    .get('/new', ApiKey_controller_1.default.generateApiKeys);
exports.default = router;
