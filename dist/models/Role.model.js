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
exports.RoleEnum = void 0;
// Import necessary modules and dependencies
const sequelize_typescript_1 = require("sequelize-typescript");
const Entity_model_1 = __importDefault(require("./Entity/Entity.model"));
// Roles for each entity
// One to one relationship with entity
var RoleEnum;
(function (RoleEnum) {
    RoleEnum["Admin"] = "ADMIN";
    RoleEnum["Partner"] = "PARTNER";
    RoleEnum["TeamMember"] = "TEAMMEMBER";
})(RoleEnum || (exports.RoleEnum = RoleEnum = {}));
let Role = class Role extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.IsUUID)(4),
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Role.prototype, "id", void 0);
__decorate([
    sequelize_typescript_1.Unique,
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], Role.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Entity_model_1.default),
    __metadata("design:type", Array)
], Role.prototype, "entities", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], Role.prototype, "description", void 0);
Role = __decorate([
    sequelize_typescript_1.Table
], Role);
exports.default = Role;
