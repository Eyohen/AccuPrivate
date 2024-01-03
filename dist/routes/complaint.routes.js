"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const Interface_1 = require("../utils/Interface");
const Complaint_controller_1 = require("../controllers/Admin/Complaint.controller");
const FileUpload_1 = __importDefault(require("../utils/FileUpload"));
exports.router = express_1.default.Router();
exports.router
    .get('/id', FileUpload_1.default.multerUpload.single('complaint_image'), (0, Interface_1.AuthenticatedController)(Complaint_controller_1.ComplaintController.getComplaint))
    .post('/create', (0, Interface_1.AuthenticatedController)(Complaint_controller_1.ComplaintController.createComplaint))
    .get('/all', (0, Interface_1.AuthenticatedController)(Complaint_controller_1.ComplaintController.getComplaints))
    .patch('/update/:id', (0, Interface_1.AuthenticatedController)(Complaint_controller_1.ComplaintController.updateComplaint))
    .get('/replies/:id', (0, Interface_1.AuthenticatedController)(Complaint_controller_1.ComplaintController.getComplaintRely))
    .post('/reply/create/:id', (0, Interface_1.AuthenticatedController)(Complaint_controller_1.ComplaintController.addComplaintReply));
exports.default = exports.router;
