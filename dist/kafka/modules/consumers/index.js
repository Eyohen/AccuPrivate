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
const Crm_1 = __importDefault(require("./Crm"));
const Inventory_1 = __importDefault(require("./Inventory"));
const Notification_1 = __importDefault(require("./Notification"));
const Partner_1 = __importDefault(require("./Partner"));
const Token_1 = __importDefault(require("./Token"));
const Transaction_1 = __importDefault(require("./Transaction"));
const User_1 = __importDefault(require("./User"));
const Vendor_1 = __importDefault(require("./Vendor"));
const Webhook_1 = __importDefault(require("./Webhook"));
class ConsumerRouter {
    static init() {
        return __awaiter(this, void 0, void 0, function* () {
            new Crm_1.default().startBatchConsumer();
            new Inventory_1.default().startBatchConsumer();
            new Notification_1.default().startBatchConsumer();
            new Partner_1.default().startBatchConsumer();
            new Token_1.default().startBatchConsumer();
            new Transaction_1.default().startBatchConsumer();
            new User_1.default().startBatchConsumer();
            new Vendor_1.default().startBatchConsumer();
            new Webhook_1.default().startBatchConsumer();
        });
    }
}
exports.default = ConsumerRouter;
