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
/**
 * Sequelize model for handling ComplaintReply entities.
 * @remarks
 * This model defines the structure of the `ComplaintReply` table in the database.
 *
 * @class
 * @extends Model
 */
const sequelize_typescript_1 = require("sequelize-typescript");
const Entity_model_1 = __importDefault(require("./Entity/Entity.model"));
const Complaint_model_1 = __importDefault(require("./Complaint.model"));
let ComplaintReply = class ComplaintReply extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.IsUUID)(4),
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], ComplaintReply.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], ComplaintReply.prototype, "message", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true, defaultValue: '' }),
    __metadata("design:type", String)
], ComplaintReply.prototype, "image", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Entity_model_1.default),
    (0, sequelize_typescript_1.IsUUID)(4),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], ComplaintReply.prototype, "entityId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Entity_model_1.default),
    __metadata("design:type", Entity_model_1.default)
], ComplaintReply.prototype, "entity", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Complaint_model_1.default),
    (0, sequelize_typescript_1.IsUUID)(4),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], ComplaintReply.prototype, "complaintId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Complaint_model_1.default),
    __metadata("design:type", Complaint_model_1.default)
], ComplaintReply.prototype, "complaint", void 0);
ComplaintReply = __decorate([
    sequelize_typescript_1.Table
], ComplaintReply);
exports.default = ComplaintReply;
