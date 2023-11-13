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
// Import necessary modules and dependencies
const sequelize_typescript_1 = require("sequelize-typescript");
const Meter_model_1 = __importDefault(require("./Meter.model"));
const Transaction_model_1 = __importDefault(require("./Transaction.model"));
// Define the Sequelize model for the "PowerUnit" table
let PowerUnit = class PowerUnit extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.IsUUID)(4),
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], PowerUnit.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], PowerUnit.prototype, "address", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], PowerUnit.prototype, "disco", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], PowerUnit.prototype, "superagent", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false, defaultValue: '0' }),
    __metadata("design:type", String)
], PowerUnit.prototype, "amount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false, defaultValue: 0 }),
    __metadata("design:type", Number)
], PowerUnit.prototype, "tokenNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false, unique: true }),
    __metadata("design:type", String)
], PowerUnit.prototype, "token", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false, defaultValue: '0' }),
    __metadata("design:type", String)
], PowerUnit.prototype, "tokenUnits", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Meter_model_1.default),
    (0, sequelize_typescript_1.IsUUID)(4),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], PowerUnit.prototype, "meterId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Meter_model_1.default),
    __metadata("design:type", Meter_model_1.default)
], PowerUnit.prototype, "meter", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Transaction_model_1.default),
    (0, sequelize_typescript_1.IsUUID)(4),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], PowerUnit.prototype, "transactionId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Transaction_model_1.default),
    __metadata("design:type", Transaction_model_1.default)
], PowerUnit.prototype, "transaction", void 0);
PowerUnit = __decorate([
    sequelize_typescript_1.Table
], PowerUnit);
exports.default = PowerUnit;
