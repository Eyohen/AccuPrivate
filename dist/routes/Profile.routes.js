"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Profile_controller_1 = __importDefault(require("../controllers/Public/Profile.controller"));
const FileUpload_1 = __importDefault(require("../utils/FileUpload"));
const Auth_1 = require("../middlewares/Auth");
const Interface_1 = require("../utils/Interface");
const router = express_1.default.Router();
router
    .use((0, Auth_1.basicAuth)('access'))
    .patch('/profilepicture', FileUpload_1.default.multerUpload.single('profile_picture'), (0, Interface_1.AuthenticatedController)(Profile_controller_1.default.updateProfile))
    .patch('/email', (0, Interface_1.AuthenticatedController)(Profile_controller_1.default.updateProfileData));
exports.default = router;
