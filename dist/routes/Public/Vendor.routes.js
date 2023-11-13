"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Vendor_controller_1 = __importDefault(require("../../controllers/Public/Vendor.controller"));
const router = express_1.default.Router();
router
    .post('/validate/meter', Vendor_controller_1.default.validateMeter)
    .post('/vend/power', Vendor_controller_1.default.requestToken)
    .get('/token', Vendor_controller_1.default.requestToken)
    .get('/discos', Vendor_controller_1.default.getDiscos)
    .get('/requery-transaction', Vendor_controller_1.default.requeryTimedOutTransaction)
    .get('/discos/check', Vendor_controller_1.default.checkDisco);
exports.default = router;
