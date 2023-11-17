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
const Password_model_1 = __importDefault(require("../Password.model"));
const Role_model_1 = __importDefault(require("../Role.model"));
const PartnerProfile_model_1 = __importDefault(require("./Profiles/PartnerProfile.model"));
const TeamMemberProfile_model_1 = __importDefault(require("./Profiles/TeamMemberProfile.model"));
// Define the "Entity" table model
let Entity = class Entity extends sequelize_typescript_1.Model {
    // Relation to partner profile
    static ensureProfileIdIsSet(instance) {
        if (!instance.teamMemberProfileId && !instance.partnerProfileId) {
            throw new Error('Either teamMemberProfileId or partnerProfileId must be set.');
        }
    }
};
__decorate([
    (0, sequelize_typescript_1.IsUUID)(4),
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Entity.prototype, "id", void 0);
__decorate([
    sequelize_typescript_1.Unique,
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], Entity.prototype, "email", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => Password_model_1.default),
    __metadata("design:type", Password_model_1.default)
], Entity.prototype, "password", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.JSONB, allowNull: false }),
    __metadata("design:type", Object)
], Entity.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], Entity.prototype, "profilePicture", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Role_model_1.default),
    (0, sequelize_typescript_1.IsUUID)(4),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING }),
    __metadata("design:type", String)
], Entity.prototype, "roleId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Role_model_1.default),
    __metadata("design:type", Role_model_1.default)
], Entity.prototype, "role", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => TeamMemberProfile_model_1.default),
    (0, sequelize_typescript_1.IsUUID)(4)
    // @NotEmpty
    // @IsIn([['teamMemberProfileId', 'partnerProfileId']])
    ,
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], Entity.prototype, "teamMemberProfileId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => PartnerProfile_model_1.default),
    (0, sequelize_typescript_1.IsUUID)(4)
    // @NotEmpty
    // @IsIn([['teamMemberProfileId', 'partnerProfileId']])
    ,
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], Entity.prototype, "partnerProfileId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => PartnerProfile_model_1.default),
    __metadata("design:type", Object)
], Entity.prototype, "partnerProfile", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => TeamMemberProfile_model_1.default),
    __metadata("design:type", Object)
], Entity.prototype, "teamMemberProfile", void 0);
__decorate([
    sequelize_typescript_1.BeforeValidate,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Entity]),
    __metadata("design:returntype", void 0)
], Entity, "ensureProfileIdIsSet", null);
Entity = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'Entities' })
], Entity);
exports.default = Entity;
