"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Webhook_controller_1 = __importDefault(require("../controllers/Public/Webhook.controller"));
const Auth_1 = require("../middlewares/Auth");
const Interface_1 = require("../utils/Interface");
const router = express_1.default.Router();
router
    .patch('/', (0, Auth_1.basicAuth)('access'), (0, Interface_1.AuthenticatedController)(Webhook_controller_1.default.updateWebhook))
    .get('/info', (0, Auth_1.basicAuth)('access'), (0, Interface_1.AuthenticatedController)(Webhook_controller_1.default.viewWebhookByPartnerId))
    .get('/', (0, Auth_1.basicAuth)('access'), (0, Interface_1.AuthenticatedController)(Webhook_controller_1.default.viewAllWebhooks)); // Admin only
exports.default = router;
