"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Vendor_controller_1 = __importDefault(require("../controllers/Public/Vendor.controller/Vendor.controller"));
const Auth_1 = require("../middlewares/Auth");
const Interface_1 = require("../utils/Interface");
const Airtime_controller_1 = require("../controllers/Public/Vendor.controller/Airtime.controller");
const router = express_1.default.Router();
router
    .post('/validate/meter', Auth_1.validateApiKey, Vendor_controller_1.default.validateMeter)
    .get('/token', Auth_1.validateApiKey, Vendor_controller_1.default.requestToken)
    .get('/discos', Vendor_controller_1.default.getDiscos)
    .get('/discos/check', Vendor_controller_1.default.checkDisco)
    .post('/confirm-payment', Auth_1.validateApiKey, (0, Interface_1.AuthenticatedController)(Vendor_controller_1.default.confirmPayment))
    .post('/validate/phone', Auth_1.validateApiKey, Airtime_controller_1.AirtimeVendController.validateAirtimeRequest)
    .get('/airtime', Auth_1.validateApiKey, Airtime_controller_1.AirtimeVendController.requestAirtime);
exports.default = router;
