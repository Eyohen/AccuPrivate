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
const Notification_model_1 = __importDefault(require("../models/Notification.model"));
const Notification_1 = __importDefault(require("../utils/Notification"));
class NotificationService {
    static addNotification(notificationData) {
        return __awaiter(this, void 0, void 0, function* () {
            const notification = Notification_model_1.default.build(notificationData);
            yield Notification_model_1.default.create(notificationData);
            return notification;
        });
    }
    static viewNotifications() {
        return __awaiter(this, void 0, void 0, function* () {
            const notifications = yield Notification_model_1.default.findAll({});
            return notifications;
        });
    }
    static viewNotificationByEntityId(entityId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = page && limit ? { where: { entityId }, limit, offset: (page - 1) * limit } : { where: { entityId } };
            const notifications = yield Notification_model_1.default.findAll(query);
            return notifications;
        });
    }
    static viewSingleNotificationById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const notification = yield Notification_model_1.default.findByPk(id);
            return notification;
        });
    }
    static viewNotificationWithCustomQuery(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const notifications = yield Notification_model_1.default.findAll(query);
            return notifications;
        });
    }
    static updateSingleNotification(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const notification = yield this.viewSingleNotificationById(id);
            if (!notification)
                return null;
            yield notification.update(data);
            const updatedNotification = yield this.viewSingleNotificationById(id);
            return updatedNotification;
        });
    }
    static sendNotification(notification) {
        return __awaiter(this, void 0, void 0, function* () {
            const notificationResult = yield Notification_1.default.sendNotificationToUser(notification.entityId, notification);
            if (!notificationResult)
                return null;
            return notificationResult;
        });
    }
    static getUnreadNotifications(entityId) {
        return __awaiter(this, void 0, void 0, function* () {
            const notifications = yield Notification_model_1.default.findAll({ where: { entityId, read: false } });
            return notifications;
        });
    }
}
exports.default = NotificationService;
