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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const Interface_1 = require("../utils/Interface");
const Errors_1 = require("../utils/Errors");
class RBACMiddelware {
}
_a = RBACMiddelware;
RBACMiddelware.validateRole = (allowedRoles) => {
    return (0, Interface_1.AuthenticatedController)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const userIsPermitted = allowedRoles.includes(req.user.user.entity.role);
        if (!userIsPermitted) {
            throw new Errors_1.ForbiddenError('Unauthorized access');
        }
        next();
    }));
};
exports.default = RBACMiddelware;
