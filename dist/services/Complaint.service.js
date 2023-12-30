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
                const complaints = yield Complaint_model_1.default.findAll(findAllObject);
                const totalItems = yield Complaint_model_1.default.count({ where: findAllObject.where });
                const totalPages = Math.ceil(totalItems / _limit);
                return {
                    complaint: complaints,
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
            }
        });
    }
}
exports.default = ComplaintService;
