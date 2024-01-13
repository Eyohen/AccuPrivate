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
const PartnerProfile_model_1 = __importDefault(require("./Entity/Profiles/PartnerProfile.model"));
// Define the "Partner" table model
let WebHook = class WebHook extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.IsUUID)(4),
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], WebHook.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], WebHook.prototype, "url", void 0);
__decorate([
    (0, sequelize_typescript_1.IsUUID)(4),
    (0, sequelize_typescript_1.ForeignKey)(() => PartnerProfile_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], WebHook.prototype, "partnerId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => PartnerProfile_model_1.default),
    __metadata("design:type", PartnerProfile_model_1.default)
], WebHook.prototype, "partner", void 0);
WebHook = __decorate([
    sequelize_typescript_1.Table
], WebHook);
exports.default = WebHook;
