"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
// Import required modules and types
const axios_1 = __importStar(require("axios"));
const querystring_1 = __importDefault(require("querystring"));
const Constants_1 = require("../utils/Constants");
const Logger_1 = __importDefault(require("../utils/Logger"));
// Define the VendorService class for handling provider-related operations
class VendorService {
    // Static method for obtaining a Baxi vending token
    static baxiVendToken(body) {
        return __awaiter(this, void 0, void 0, function* () {
            const { transactionId, meterNumber, disco, amount, phone } = body;
            try {
                const response = yield this.baxiAxios().post('/request', {
                    amount,
                    phone,
                    account_number: meterNumber,
                    service_type: disco.toLowerCase() + '_electric' + '_prepaid',
                    agentId: 'baxi',
                    agentReference: transactionId
                });
                return response.data.data;
            }
            catch (error) {
                Logger_1.default.error(error);
                throw new Error(error.message);
            }
        });
    }
    // Static method for validating a meter with Baxi
    static baxiValidateMeter(disco, meterNumber, vendType) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceType = disco.toLowerCase() + '_electric' + `_${vendType.toLowerCase()}`; // e.g. aedc_electric_prepaid
            const postData = {
                service_type: serviceType,
                account_number: Constants_1.NODE_ENV === 'development' ? '6528651914' : meterNumber // Baxi has a test meter number
            };
            try {
                const response = yield this.baxiAxios().post('/verify', postData);
                return response.data.data;
            }
            catch (error) {
                Logger_1.default.error(error);
                throw new Error(error.message);
            }
        });
    }
    static baxiFetchAvailableDiscos() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.baxiAxios().get('/billers');
                const responseData = response.data;
                const providers = [];
                for (const provider of responseData.data.providers) {
                    const serviceProvider = provider.service_type.split('_')[0].toUpperCase();
                    const serviceType = provider.service_type.split('_')[2].toUpperCase();
                    if (provider.service_type.includes('electric')) {
                        providers.push({
                            name: serviceProvider + ` ${serviceType}`,
                            serviceType: serviceType,
                        });
                    }
                }
                return providers;
            }
            catch (error) {
                Logger_1.default.error(error);
                throw new Error();
            }
        });
    }
    // Static method for checking Disco updates with Baxi
    static baxiCheckDiscoUp(disco) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const responseData = yield this.baxiFetchAvailableDiscos();
                for (const provider of responseData) {
                    const name = provider.name.split(' ')[0];
                    if (name.toUpperCase() === disco.toUpperCase()) {
                        return true;
                    }
                }
                return false;
            }
            catch (error) {
                Logger_1.default.error(error);
                throw new Error();
            }
        });
    }
    static baxiAxios() {
        const AxiosCreate = axios_1.default.create({
            baseURL: `${Constants_1.BAXI_URL}`,
            headers: {
                'x-api-key': Constants_1.BAXI_TOKEN
            }
        });
        return AxiosCreate;
    }
    // Static method for creating a BuyPower Axios instance
    static buyPowerAxios() {
        // Create an Axios instance with BuyPower URL and token in the headers
        const AxiosCreate = axios_1.default.create({
            baseURL: `${Constants_1.BUYPOWER_URL}`,
            headers: {
                Authorization: `Bearer ${Constants_1.BUYPOWER_TOKEN}`
            }
        });
        return AxiosCreate;
    }
    // Static method for vending a token with BuyPower
    static buyPowerVendToken(body) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            // Define data to be sent in the POST request
            const postData = {
                orderId: body.transactionId,
                meter: body.meterNumber,
                disco: body.disco,
                paymentType: "B2B",
                vendType: body.vendType.toUpperCase(),
                amount: body.amount,
                phone: body.phone
            };
            if (Constants_1.NODE_ENV === 'development') {
                postData.phone = '08034210294';
                postData.meter = '12345678910';
            }
            try {
                // Make a POST request using the BuyPower Axios instance
                const response = yield this.buyPowerAxios().post(`/vend?strict=0`, postData);
                return response.data;
            }
            catch (error) {
                if (error instanceof axios_1.AxiosError) {
                    if (((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) === "An unexpected error occurred. Please requery.") {
                        Logger_1.default.error(error.message, { meta: { stack: error.stack, responseData: error.response.data } });
                        throw new Error('Transaction timeout');
                    }
                }
                throw error;
            }
        });
    }
    static buyPowerRequeryTransaction({ transactionId }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.buyPowerAxios().get(`/transaction/${transactionId}`);
                const successResponse = response.data;
                if (successResponse.result.status === true) {
                    return {
                        status: true,
                        message: 'Transaction successful',
                        data: successResponse.result.data,
                        responseCode: 200
                    };
                }
                return response.data;
            }
            catch (error) {
                throw error;
            }
        });
    }
    // Static method for validating a meter with BuyPower
    static buyPowerValidateMeter(body) {
        return __awaiter(this, void 0, void 0, function* () {
            // Define query parameters using the querystring module
            const paramsObject = {
                meter: Constants_1.NODE_ENV === 'development' ? '12345678910' : body.meterNumber,
                disco: body.disco,
                vendType: body.vendType.toUpperCase(),
                vertical: 'ELECTRICITY'
            };
            const params = querystring_1.default.stringify(paramsObject);
            try {
                // Make a GET request using the BuyPower Axios instance
                const response = yield this.buyPowerAxios().get(`/check/meter?${params}`);
                return response.data;
            }
            catch (error) {
                throw new Error('An error occurred while validating meter');
            }
        });
    }
    // Static method for checking Disco updates with BuyPower
    static buyPowerCheckDiscoUp(disco) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Make a GET request to check Disco updates
                const response = yield this.buyPowerAxios().get(`${Constants_1.BUYPOWER_URL}/discos/status`);
                const data = response.data;
                if (data[disco.toUpperCase()] === true)
                    return true;
                else
                    return false;
            }
            catch (error) {
                Logger_1.default.info(error);
                throw new Error();
            }
        });
    }
    static buyPowerFetchAvailableDiscos() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const providers = [];
                const response = yield this.buyPowerAxios().get('/discos/status');
                const responseData = response.data;
                for (const key of Object.keys(responseData)) {
                    if (responseData[key] === true) {
                        providers.push({
                            name: key.toUpperCase() + ' PREPAID',
                            serviceType: 'PREPAID',
                        });
                        providers.push({
                            name: key.toUpperCase() + ' POSTPAID',
                            serviceType: 'POSTPAID',
                        });
                    }
                }
                return providers;
            }
            catch (error) {
                Logger_1.default.error(error);
                throw new Error();
            }
        });
    }
}
exports.default = VendorService;
