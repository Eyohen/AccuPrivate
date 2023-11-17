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
const Partner_model_1 = __importDefault(require("./Partner.model"));
// Define the Sequelize model for the "ApiKey" table
let ApiKey = class ApiKey extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.IsUUID)(4),
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], ApiKey.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], ApiKey.prototype, "key", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Partner_model_1.default),
    (0, sequelize_typescript_1.IsUUID)(4),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], ApiKey.prototype, "partnerId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Partner_model_1.default),
    __metadata("design:type", Partner_model_1.default)
], ApiKey.prototype, "partner", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.BOOLEAN, allowNull: false }),
    __metadata("design:type", Boolean)
], ApiKey.prototype, "active", void 0);
ApiKey = __decorate([
    sequelize_typescript_1.Table
], ApiKey);
exports.default = ApiKey;
