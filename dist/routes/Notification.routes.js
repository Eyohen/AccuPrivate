"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Interface_1 = require("../utils/Interface");
const Notification_controller_1 = __importDefault(require("../controllers/Public/Notification.controller"));
const Auth_1 = require("../middlewares/Auth");
const router = (0, express_1.Router)();
router
    .use((0, Auth_1.basicAuth)('access'))
    .get('/', (0, Interface_1.AuthenticatedController)(Notification_controller_1.default.getNotifications))
    .get('/info', (0, Interface_1.AuthenticatedController)(Notification_controller_1.default.getNotificationInfo))
    .post('/send', (0, Interface_1.AuthenticatedController)(Notification_controller_1.default.sendNotification))
    .post('/markread', (0, Interface_1.AuthenticatedController)(Notification_controller_1.default.markNotificationsAsRead))
    .patch('/preference', (0, Interface_1.AuthenticatedController)(Notification_controller_1.default.updateNotificationPreference))
    .get('/preference', (0, Interface_1.AuthenticatedController)(Notification_controller_1.default.getNotificationPreference));
exports.default = router;
