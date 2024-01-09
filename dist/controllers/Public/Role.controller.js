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
const Errors_1 = require("../../utils/Errors");
const Role_service_1 = __importDefault(require("../../services/Role.service"));
class RoleController {
    static getRoleInfo(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { roleId } = req.query;
            const role = yield Role_service_1.default.viewRoleById(roleId);
            if (!role) {
                throw new Errors_1.BadRequestError('Role not found');
            }
            res.status(200).json({
                status: 'success',
                message: 'Role retrieved successfully',
                data: { role }
            });
        });
    }
    static getRoles(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const roles = yield Role_service_1.default.viewAllRoles();
            res.status(200).json({
                status: 'success',
                message: 'Roles retrieved successfully',
                data: { roles }
            });
        });
    }
}
exports.default = RoleController;
