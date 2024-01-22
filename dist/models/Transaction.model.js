"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentType = exports.Status = void 0;
// Import necessary modules and dependencies
const sequelize_typescript_1 = require("sequelize-typescript");
const User_model_1 = __importDefault(require("./User.model"));
const PartnerProfile_model_1 = __importDefault(require("./Entity/Profiles/PartnerProfile.model"));
const Event_model_1 = __importDefault(require("./Event.model"));
const PowerUnit_model_1 = __importDefault(require("./PowerUnit.model"));
const Meter_model_1 = __importDefault(require("./Meter.model"));
const Helper_1 = require("../utils/Helper");
const Date_1 = require("../utils/Date");
// Define enums for status and payment type
var Status;
(function (Status) {
    Status["COMPLETE"] = "COMPLETE";
    Status["PENDING"] = "PENDING";
    Status["FAILED"] = "FAILED";
    Status["FLAGGED"] = "FLAGGED";
})(Status || (exports.Status = Status = {}));
var PaymentType;
(function (PaymentType) {
    PaymentType["REVERSAL"] = "REVERSAL";
    PaymentType["PAYMENT"] = "PAYMENT";
})(PaymentType || (exports.PaymentType = PaymentType = {}));
// Define the Sequelize model for the "Transaction" table
let Transaction = class Transaction extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.IsUUID)(4),
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Transaction.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false, defaultValue: '0' }),
    __metadata("design:type", String)
], Transaction.prototype, "amount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.ENUM, values: Object.values(Status), defaultValue: Status.PENDING, allowNull: false }),
    __metadata("design:type", String)
], Transaction.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.ENUM, values: Object.values(PaymentType), defaultValue: PaymentType.PAYMENT, allowNull: false }),
    __metadata("design:type", String)
], Transaction.prototype, "paymentType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: false }),
    __metadata("design:type", Date)
], Transaction.prototype, "transactionTimestamp", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], Transaction.prototype, "disco", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true, unique: true }),
    __metadata("design:type", String)
], Transaction.prototype, "bankRefId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], Transaction.prototype, "bankComment", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", Object)
], Transaction.prototype, "superagent", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true, defaultValue: () => (0, Helper_1.generateRandomString)(10) }),
    __metadata("design:type", String)
], Transaction.prototype, "reference", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => User_model_1.default),
    (0, sequelize_typescript_1.IsUUID)(4),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Transaction.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => User_model_1.default),
    __metadata("design:type", User_model_1.default)
], Transaction.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => PartnerProfile_model_1.default),
    (0, sequelize_typescript_1.IsUUID)(4),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Transaction.prototype, "partnerId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => PartnerProfile_model_1.default),
    (0, sequelize_typescript_1.IsUUID)(4),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Transaction.prototype, "powerUnitId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => PartnerProfile_model_1.default),
    __metadata("design:type", PartnerProfile_model_1.default)
], Transaction.prototype, "partner", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Event_model_1.default),
    __metadata("design:type", Array)
], Transaction.prototype, "events", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => PowerUnit_model_1.default),
    __metadata("design:type", PowerUnit_model_1.default)
], Transaction.prototype, "powerUnit", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Meter_model_1.default),
    (0, sequelize_typescript_1.IsUUID)(4),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Transaction.prototype, "meterId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Meter_model_1.default),
    __metadata("design:type", Meter_model_1.default)
], Transaction.prototype, "meter", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
        defaultValue: new Date_1.NigerianDate().getCurrentNigerianDate(),
    }),
    __metadata("design:type", Date)
], Transaction.prototype, "createdAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
        defaultValue: new Date_1.NigerianDate().getCurrentNigerianDate(),
    }),
    __metadata("design:type", Date)
], Transaction.prototype, "updatedAt", void 0);
Transaction = __decorate([
    sequelize_typescript_1.Table
], Transaction);
exports.default = Transaction;
