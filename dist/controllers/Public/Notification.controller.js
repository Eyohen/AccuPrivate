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
const Notification_1 = __importDefault(require("../../utils/Notification"));
const Notification_service_1 = __importDefault(require("../../services/Notification.service"));
const Errors_1 = require("../../utils/Errors");
const Notification_model_1 = __importDefault(require("../../models/Notification.model"));
const Entity_service_1 = __importDefault(require("../../services/Entity/Entity.service"));
const sequelize_1 = require("sequelize");
const Role_model_1 = require("../../models/Role.model");
class NotificationController {
    static getNotifications(req, res, _next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { entity: { id } } = req.user.user;
            const { page, limit, status } = req.query;
            const query = { where: {} };
            const role = req.user.user.entity.role;
            const requestWasMadeByAnAdmin = [Role_model_1.RoleEnum.Admin].includes(role);
            if (!requestWasMadeByAnAdmin) {
                query.where['entityId'] = id;
            }
            query.where = status === 'read' ? Object.assign(Object.assign({}, query.where), { read: true }) : status === 'unread' ? Object.assign({ read: false }, query.where) : query.where;
            if (limit)
                query.limit = parseInt(limit);
            if (page && page != '0' && limit) {
                query.offset = Math.abs(parseInt(page) - 1) * parseInt(limit);
            }
            const notifications = yield Notification_service_1.default.viewNotificationWithCustomQuery(query);
            res.status(200).json({
                status: 'success',
                message: 'Notifications fetched successfully',
                data: {
                    notifications
                }
            });
        });
    }
    static getNotificationInfo(req, res, _next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { notificationId } = req.query;
            const notification = yield Notification_service_1.default.viewSingleNotificationById(notificationId);
            if (!notification) {
                throw new Errors_1.NotFoundError('Notification not found');
            }
            res.status(200).json({
                status: 'success',
                message: 'Notification fetched successfully',
                data: {
                    notification
                }
            });
        });
    }
    static sendNotification(req, res, _next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { notificationId, userId } = req.body;
            const notification = yield Notification_service_1.default.viewSingleNotificationById(notificationId);
            if (!notification) {
                throw new Errors_1.NotFoundError('Notification not found');
            }
            const notificationResult = userId
                ? yield Notification_1.default.sendNotificationToUser(userId, notification)
                : yield Notification_service_1.default.sendNotification(notification);
            if (!notificationResult) {
                throw new Errors_1.NotFoundError('Notification not found');
            }
            res.status(200).json({
                status: 'success',
                message: 'Notification sent successfully',
                data: {
                    notification
                }
            });
        });
    }
    static updateNotificationPreference(req, res, _next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { preference } = req.body;
            const { entity } = req.user.user;
            const entityRecord = yield Entity_service_1.default.viewSingleEntity(entity.id);
            if (!entityRecord) {
                throw new Errors_1.NotFoundError('Entity not found');
            }
            const updatedEntity = yield Entity_service_1.default.updateEntity(entityRecord, { notificationSettings: Object.assign(Object.assign({}, entity.notificationSettings), preference) });
            res.status(200).json({
                status: 'success',
                message: 'Notification preference updated successfully',
                data: {
                    preference: updatedEntity.notificationSettings
                }
            });
        });
    }
    static markNotificationsAsRead(req, res, _next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { entity: { id } } = req.user.user;
            const { notificationIds } = req.body;
            const notifications = yield Notification_model_1.default.findAll({ where: { id: { [sequelize_1.Op.in]: notificationIds }, entityId: id } });
            const allNotificationsExist = notifications.length === notificationIds.length;
            if (!allNotificationsExist) {
                throw new Errors_1.NotFoundError('One or more notifications not found');
            }
            yield Notification_model_1.default.update({ read: true }, { where: { id: { [sequelize_1.Op.in]: notificationIds }, entityId: id } });
            res.status(200).json({
                status: 'success',
                message: 'Notifications marked as read successfully',
                data: null
            });
        });
    }
    static getNotificationPreference(req, res, _next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { entity: { id } } = req.user.user;
            const entity = yield Entity_service_1.default.viewSingleEntity(id);
            if (!entity) {
                throw new Errors_1.NotFoundError('Entity not found');
            }
            res.status(200).json({
                status: 'success',
                message: 'Notification preference fetched successfully',
                data: {
                    preference: entity.notificationSettings
                }
            });
        });
    }
}
exports.default = NotificationController;
