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
exports.Status = void 0;
/**
 * Sequelize model for handling Complaint entities.
 * @remarks
 * This model defines the structure of the `Complaint` table in the database.
 *
 * @class
 * @extends Model
 */
const sequelize_typescript_1 = require("sequelize-typescript");
const Entity_model_1 = __importDefault(require("./Entity/Entity.model"));
// Define an enum for the status of complaint
var Status;
(function (Status) {
    Status["OPEN"] = "OPEN";
    Status["PENDING"] = "PENDING";
    Status["CLOSED"] = "CLOSED";
})(Status || (exports.Status = Status = {}));
let Complaint = class Complaint extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.IsUUID)(4),
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Complaint.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], Complaint.prototype, "category", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], Complaint.prototype, "message", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false, defaultValue: '' }),
    __metadata("design:type", String)
], Complaint.prototype, "title", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true, defaultValue: '' }),
    __metadata("design:type", String)
], Complaint.prototype, "image", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Entity_model_1.default),
    (0, sequelize_typescript_1.IsUUID)(4),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Complaint.prototype, "entityId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Entity_model_1.default),
    __metadata("design:type", Entity_model_1.default)
], Complaint.prototype, "entity", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.ENUM, values: Object.values(Status), defaultValue: Status.PENDING, allowNull: false }),
    __metadata("design:type", String)
], Complaint.prototype, "status", void 0);
Complaint = __decorate([
    sequelize_typescript_1.Table
], Complaint);
exports.default = Complaint;
