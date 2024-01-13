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
exports.CRMPublisher = void 0;
const Constants_1 = require("../../Constants");
const Producer_1 = __importDefault(require("../util/Producer"));
class CRMPublisher extends Producer_1.default {
    static publishEventForInitiatedUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Producer_1.default.sendMessage({
                topic: Constants_1.TOPICS.CREATE_USER_INITIATED,
                message: {
                    user: {
                        name: data.user.name,
                        email: data.user.email,
                        address: data.user.address,
                        phoneNumber: data.user.phoneNumber
                    },
                    transactionId: data.transactionId
                }
            });
        });
    }
    static publishEventForConfirmedUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Producer_1.default.sendMessage({
                topic: Constants_1.TOPICS.CREATE_USER_CONFIRMED,
                message: {
                    user: {
                        name: data.user.name,
                        email: data.user.email,
                        address: data.user.address,
                        phoneNumber: data.user.phoneNumber,
                        id: data.user.id
                    },
                    transactionId: data.transactionId
                }
            });
        });
    }
}
exports.CRMPublisher = CRMPublisher;
