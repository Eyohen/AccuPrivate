"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const Errors_1 = require("../../utils/Errors");
const Role_service_1 = __importDefault(require("../../services/Role.service"));
const Role_model_1 = require("../../models/Role.model");
class RoleController {
    //  Create role
    static createRole(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, description, type } = req.body;
            const role = yield Role_service_1.default.addRole({ name, description, id: (0, uuid_1.v4)(), type });
            res.status(200).json({
                status: 'success',
                message: 'Role created successfully',
                data: { role }
            });
        });
    }
    static updateRole(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { roleId, name, description } = req.body;
            const role = yield Role_service_1.default.viewRoleById(roleId);
            if (!role) {
                throw new Errors_1.BadRequestError('Role not found');
            }
            // Check if role name is among the default roles
            if ((Object.values(Role_model_1.RoleEnum).includes(name) || Object.values(Role_model_1.RoleEnum).includes(role.name)) && name) {
                throw new Errors_1.BadRequestError('You cannot update name of a default role');
            }
            const updatedRole = yield Role_service_1.default.updateRole(role, { name, description });
            res.status(200).json({
                status: 'success',
                message: 'Role updated successfully',
                data: { role: updatedRole }
            });
        });
    }
}
exports.default = RoleController;
