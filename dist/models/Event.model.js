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
// Import necessary modules and dependencies
const sequelize_typescript_1 = require("sequelize-typescript");
const Transaction_model_1 = __importDefault(require("./Transaction.model"));
// Define an enum for the status of events
var Status;
(function (Status) {
    Status["COMPLETE"] = "COMPLETE";
    Status["PENDING"] = "PENDING";
    Status["FAILED"] = "FAILED";
})(Status || (exports.Status = Status = {}));
// Define the Sequelize model for the "Event" table
let Event = class Event extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.IsUUID)(4),
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Event.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: false }),
    __metadata("design:type", Date)
], Event.prototype, "eventTimestamp", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.ENUM, values: Object.values(Status), defaultValue: Status.PENDING, allowNull: false }),
    __metadata("design:type", String)
], Event.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], Event.prototype, "eventType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], Event.prototype, "eventText", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], Event.prototype, "source", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING || sequelize_typescript_1.DataType.JSON, allowNull: false }),
    __metadata("design:type", Object)
], Event.prototype, "eventData", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Transaction_model_1.default),
    (0, sequelize_typescript_1.IsUUID)(4),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Event.prototype, "transactionId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Transaction_model_1.default),
    __metadata("design:type", Transaction_model_1.default)
], Event.prototype, "transaction", void 0);
Event = __decorate([
    sequelize_typescript_1.Table
], Event);
exports.default = Event;
