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
const Transaction_model_1 = __importDefault(require("../../Transaction.model"));
const ApiKey_model_1 = __importDefault(require("../../ApiKey.model"));
const Entity_model_1 = __importDefault(require("../Entity.model"));
const TeamMemberProfile_model_1 = __importDefault(require("./TeamMemberProfile.model"));
// Define the "Partner" table model
let PartnerProfile = class PartnerProfile extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.IsUUID)(4),
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], PartnerProfile.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], PartnerProfile.prototype, "email", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => Entity_model_1.default),
    __metadata("design:type", Entity_model_1.default)
], PartnerProfile.prototype, "entity", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Transaction_model_1.default),
    __metadata("design:type", Array)
], PartnerProfile.prototype, "transactions", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => TeamMemberProfile_model_1.default),
    __metadata("design:type", Array)
], PartnerProfile.prototype, "teamMembers", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => ApiKey_model_1.default),
    __metadata("design:type", Array)
], PartnerProfile.prototype, "apiKeys", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], PartnerProfile.prototype, "key", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], PartnerProfile.prototype, "sec", void 0);
PartnerProfile = __decorate([
    sequelize_typescript_1.Table
], PartnerProfile);
exports.default = PartnerProfile;
