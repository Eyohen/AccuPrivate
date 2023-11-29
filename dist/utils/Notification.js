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
const axios_1 = __importDefault(require("axios"));
const Constants_1 = require("./Constants");
const Logger_1 = __importDefault(require("./Logger"));
/**
 * Login
 * Failed txn
 * New account
 */
class NotificationUtil {
    static sendNotificationToUser(userId, notification) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // send notification to user
                const notificationDetails = {
                    name: notification.title,
                    include_aliases: { external_id: [userId] },
                    target_channel: "push",
                    contents: {
                        en: notification.message
                    },
                    headings: {
                        en: notification.heading || notification.title
                    },
                    app_id: Constants_1.ONESIGNAL_APP_ID
                };
                yield this.API.post('', notificationDetails);
                return 'success';
            }
            catch (error) {
                Logger_1.default.error('Error sending notification to users', { meta: { error } });
                return null;
            }
        });
    }
}
NotificationUtil.API = axios_1.default.create({
    'baseURL': 'https://onesignal.com/api/v1/notifications',
    'headers': {
        'Authorization': `Basic ${Constants_1.ONESIGNAL_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});
exports.default = NotificationUtil;
