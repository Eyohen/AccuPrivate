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
const Complaint_model_1 = __importDefault(require("../models/Complaint.model"));
const Entity_model_1 = __importDefault(require("../models/Entity/Entity.model"));
const ComplaintReply_model_1 = __importDefault(require("../models/ComplaintReply.model"));
const Logger_1 = __importDefault(require("../utils/Logger"));
const uuid_1 = require("uuid");
class ComplaintService {
    static addComplaint(complaint) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(complaint);
                const newComplaint = yield Complaint_model_1.default.build(Object.assign({ id: (0, uuid_1.v4)() }, complaint));
                yield newComplaint.save();
                return newComplaint;
            }
            catch (err) {
                Logger_1.default.error("Error Logging Event");
                throw err;
            }
        });
    }
    static viewSingleComplaint(uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const complaint = yield Complaint_model_1.default.findOne({
                    where: { id: uuid },
                    include: [Entity_model_1.default],
                });
                return complaint;
            }
            catch (err) {
                Logger_1.default.error("Error Reading Complaint");
                throw err;
            }
        });
    }
    static viewAllComplainsPaginatedFiltered(limit, offset, entityId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            let _limit = 9;
            let _offset = 1;
            // const where: { entityId?: string } = {};
            const findAllObject = {};
            if (limit)
                findAllObject.limt = limit;
            if (offset)
                findAllObject.offset = offset - 1;
            if (entityId || status)
                findAllObject.where = {};
            if (entityId)
                findAllObject.where.entityId = entityId;
            if (status)
                findAllObject.where.status = status;
            console.log(findAllObject);
            try {
                const complaints = yield Complaint_model_1.default.findAndCountAll(findAllObject);
                const totalItems = complaints.count;
                const totalPages = Math.ceil(totalItems / _limit);
                return {
                    complaint: complaints.rows,
                    pagination: {
                        currentPage: _offset,
                        pageSize: _limit,
                        totalItems,
                        totalPages
                    }
                };
            }
            catch (err) {
                console.log(err);
                Logger_1.default.error("Error Reading Complaints");
                throw err;
            }
        });
    }
    static updateAComplaint(uuid, complaint) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield Complaint_model_1.default.update(complaint, { where: { id: uuid } });
                let _complaint = null;
                if (result[0] > 1)
                    _complaint = yield Complaint_model_1.default.findByPk(uuid);
                return {
                    result,
                    _complaint
                };
            }
            catch (error) {
                console.log(error);
                Logger_1.default.error("Error Reading Complaints");
                throw error;
            }
        });
    }
    static addComplaintReply(uuid, complaintReply) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const complaint : Complaint | null = await Complaint.findByPk(uuid)
                // const ComplaintReply =  await complaint?.$create('complaintReplies', complaintReply )
                // return ComplaintReply
                const newComplaintRely = yield ComplaintReply_model_1.default.build(Object.assign({ id: (0, uuid_1.v4)(), complaintId: uuid }, complaintReply));
                yield newComplaintRely.save();
                return newComplaintRely;
            }
            catch (error) {
                console.log(error);
                Logger_1.default.error("Error Reading Complaints");
                throw error;
            }
        });
    }
    static viewListOfComplaintPaginatedRelies(uuid, limit, offset) {
        return __awaiter(this, void 0, void 0, function* () {
            let _limit = 9;
            let _offset = 1;
            const findAllObject = {};
            console.log(uuid, 'inner');
            if (limit)
                findAllObject.limt = limit;
            if (offset)
                findAllObject.offset = offset - 1;
            try {
                const complaint = yield Complaint_model_1.default.findByPk(uuid, {
                    include: [Object.assign(Object.assign({ model: ComplaintReply_model_1.default }, findAllObject), { include: [Entity_model_1.default] })]
                });
                if (uuid) {
                    findAllObject.where = {};
                    findAllObject.where.complaintId = uuid;
                }
                const totalItems = yield ComplaintReply_model_1.default.count({ where: findAllObject.where });
                console.log(totalItems);
                const totalPages = Math.ceil(totalItems / _limit);
                return {
                    complaint: complaint,
                    pagination: {
                        currentPage: _offset,
                        pageSize: _limit,
                        totalItems,
                        totalPages
                    }
                };
            }
            catch (error) {
                console.log(error);
                Logger_1.default.error("Error Reading Complaints Relpies");
                throw error;
            }
        });
    }
}
exports.default = ComplaintService;
