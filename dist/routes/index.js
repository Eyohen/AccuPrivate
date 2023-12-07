"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Transaction_routes_1 = __importDefault(require("./Transaction.routes"));
const Vendor_routes_1 = __importDefault(require("./Vendor.routes"));
const Meter_routes_1 = __importDefault(require("./Meter.routes"));
const PowerUnit_routes_1 = __importDefault(require("./PowerUnit.routes"));
const User_routes_1 = __importDefault(require("./User.routes"));
const Auth_routes_1 = __importDefault(require("./Auth.routes"));
const Apikey_routes_1 = __importDefault(require("./Apikey.routes"));
const Profile_routes_1 = __importDefault(require("./Profile.routes"));
const Role_routes_1 = __importDefault(require("./Role.routes"));
const TeamMember_routes_1 = __importDefault(require("./TeamMember.routes"));
const Notification_routes_1 = __importDefault(require("./Notification.routes"));
const Event_routes_1 = __importDefault(require("./Event.routes"));
const Partner_routes_1 = __importDefault(require("./Partner.routes"));
const router = (0, express_1.Router)();
router
    .use('/transaction', Transaction_routes_1.default)
    .use('/vendor', Vendor_routes_1.default)
    .use('/meter', Meter_routes_1.default)
    .use('/powerunit', PowerUnit_routes_1.default)
    .use('/user', User_routes_1.default)
    .use('/auth', Auth_routes_1.default)
    .use('/key', Apikey_routes_1.default)
    .use('/profile', Profile_routes_1.default)
    .use('/role', Role_routes_1.default)
    .use('/team', TeamMember_routes_1.default)
    .use('/notification', Notification_routes_1.default)
    .use('/event', Event_routes_1.default)
    .use('/partner', Partner_routes_1.default);
exports.default = router;
