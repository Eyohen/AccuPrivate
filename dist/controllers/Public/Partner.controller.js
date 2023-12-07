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
Object.defineProperty(exports, "__esModule", { value: true });
const Profiles_1 = require("../../services/Entity/Profiles");
const Errors_1 = require("../../utils/Errors");
class PartnerController {
    static getSinglePartner(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { partnerId } = req.query;
            const partner = yield Profiles_1.PartnerProfileService.viewSinglePartner(partnerId);
            if (!partner) {
                throw new Errors_1.InternalServerError("Partner Not found");
            }
            partner === null || partner === void 0 ? true : delete partner.key;
            partner === null || partner === void 0 ? true : delete partner.sec;
            res.status(200).json({
                status: 'success',
                message: 'Partners data retrieved successfully',
                data: {
                    partner
                }
            });
        });
    }
    static getAllPartners(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page, limit, } = req.query;
            const query = { where: {} };
            if (limit)
                query.limit = parseInt(limit);
            else
                query.limit = 10;
            if (page && page != '0' && limit) {
                query.offset = Math.abs(parseInt(page) - 1) * parseInt(limit);
            }
            else {
                query.offset = 0;
            }
            const _partners = yield Profiles_1.PartnerProfileService.viewPartnersWithCustomQuery(query);
            if (!_partners) {
                throw new Errors_1.InternalServerError("Partners Not found");
            }
            const partners = _partners.map(item => {
                delete item.key;
                delete item.sec;
                return item;
            });
            const pagination = {
                page: parseInt(page),
                limit: parseInt(limit),
                totalCount: partners.length,
                totalPages: Math.ceil(partners.length / parseInt(limit))
            };
            const response = {
                partners
            };
            if (page && page != '0' && limit) {
                response['paginationData'] = pagination;
            }
            res.status(200).json({
                status: 'success',
                message: 'Partners data retrieved successfully',
                data: response
            });
        });
    }
}
exports.default = PartnerController;
