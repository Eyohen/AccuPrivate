"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Consumer_1 = __importDefault(require("../util/Consumer"));
const MessageProcessor_1 = __importDefault(require("../util/MessageProcessor"));
class UserConsumer extends Consumer_1.default {
    constructor() {
        const messageProcessor = new MessageProcessor_1.default({}, 'USER_CONSUMER');
        super(messageProcessor);
    }
}
exports.default = UserConsumer;
