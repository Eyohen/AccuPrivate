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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenHandlerUtil = exports.getCurrentWaitTimeForRequeryEvent = void 0;
const axios_1 = require("axios");
const Transaction_model_1 = require("../../../models/Transaction.model");
const PowerUnit_service_1 = __importDefault(require("../../../services/PowerUnit.service"));
const Transaction_service_1 = __importDefault(require("../../../services/Transaction.service"));
const TransactionEvent_service_1 = __importDefault(require("../../../services/TransactionEvent.service"));
const Constants_1 = require("../../../utils/Constants");
const Logger_1 = __importDefault(require("../../../utils/Logger"));
const Constants_2 = require("../../Constants");
const Vendor_1 = require("../publishers/Vendor");
const Consumer_1 = __importDefault(require("../util/Consumer"));
const Interface_1 = require("../util/Interface");
const MessageProcessor_1 = __importDefault(require("../util/MessageProcessor"));
const uuid_1 = require("uuid");
const Event_service_1 = __importDefault(require("../../../services/Event.service"));
const Vendor_service_1 = __importDefault(require("../../../services/Vendor.service"));
const Helper_1 = require("../../../utils/Helper");
const retry = {
    count: 0,
    // limit: 5,
    retryCountBeforeSwitchingVendor: 2,
};
const TEST_FAILED = Constants_1.NODE_ENV === 'production' ? false : false; // TOGGLE - Will simulate failed transaction
const TransactionErrorCodeAndCause = {
    501: Interface_1.TransactionErrorCause.MAINTENANCE_ACCOUNT_ACTIVATION_REQUIRED,
    500: Interface_1.TransactionErrorCause.UNEXPECTED_ERROR,
    202: Interface_1.TransactionErrorCause.TRANSACTION_TIMEDOUT
};
function getCurrentWaitTimeForRequeryEvent(retryCount) {
    // Use geometric progression  calculate wait time, where R = 2
    const waitTime = 2 ** (retryCount - 1);
    return waitTime;
}
exports.getCurrentWaitTimeForRequeryEvent = getCurrentWaitTimeForRequeryEvent;
class TokenHandlerUtil {
    static triggerEventToRequeryTransactionTokenFromVendor({ eventService, eventData, transactionTimedOutFromBuypower, tokenInResponse, retryCount, superAgent }) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if the transaction has hit the requery limit
            // If yes, flag transaction
            if (retryCount >= Constants_1.MAX_REQUERY_PER_VENDOR) {
                Logger_1.default.info(`Flagged transaction with id ${eventData.transactionId} after hitting requery limit`);
                return yield Transaction_service_1.default.updateSingleTransaction(eventData.transactionId, { status: Transaction_model_1.Status.FLAGGED });
            }
            /**
             * Not all transactions that are requeried are due to timeout
             * Some transactions are requeried because the transaction is still processing
             * or an error occured while processing the transaction
             *
             * These errors include:
             * 202 - Timeout / Transaction is processing
             * 501 - Maintenance error
             * 500 - Unexpected Error
             */
            transactionTimedOutFromBuypower && (yield eventService.addTokenRequestTimedOutEvent());
            !tokenInResponse && (yield eventService.addTokenRequestFailedNotificationToPartnerEvent());
            const _eventMessage = Object.assign(Object.assign({}, eventData), { error: {
                    code: 202,
                    cause: transactionTimedOutFromBuypower
                        ? Interface_1.TransactionErrorCause.TRANSACTION_TIMEDOUT
                        : Interface_1.TransactionErrorCause.NO_TOKEN_IN_RESPONSE,
                } });
            Logger_1.default.info(`Retrying transaction with id ${eventData.transactionId} from vendor`);
            yield eventService.addGetTransactionTokenRequestedFromVendorRetryEvent(_eventMessage.error, retryCount);
            const eventMetaData = {
                transactionId: eventData.transactionId,
                meter: eventData.meter,
                error: eventData.error,
                timeStamp: new Date(),
                retryCount,
                superAgent,
                waitTime: getCurrentWaitTimeForRequeryEvent(retryCount)
            };
            // Start timer to requery transaction at intervals
            function countDownTimer(time) {
                return __awaiter(this, void 0, void 0, function* () {
                    for (let i = time; i > 0; i--) {
                        setTimeout(() => {
                            Logger_1.default.info(`Retrying transaction ${i} seconds`);
                        }, (time - i) * 1000);
                    }
                });
            }
            countDownTimer(eventMetaData.waitTime);
            // Publish event in increasing intervals of seconds i.e 1, 2, 4, 8, 16, 32, 64, 128, 256, 512
            // TODO: Use an external service to schedule this task
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                Logger_1.default.info('Retrying transaction from vendor');
                yield Vendor_1.VendorPublisher.publishEventForGetTransactionTokenRequestedFromVendorRetry(eventMetaData);
            }), eventMetaData.waitTime * 1000);
        });
    }
    static triggerEventToRetryTransactionWithNewVendor({ transaction, transactionEventService, meter, }) {
        return __awaiter(this, void 0, void 0, function* () {
            // Attempt purchase from new vendor
            if (!transaction.bankRefId)
                throw new Error('BankRefId not found');
            const newVendor = yield TokenHandlerUtil.getNextBestVendorForVendRePurchase(transaction.superagent);
            yield transactionEventService.addPowerPurchaseRetryWithNewVendor({ bankRefId: transaction.bankRefId, currentVendor: transaction.superagent, newVendor });
            const user = yield transaction.$get('user');
            if (!user)
                throw new Error('User not found for transaction');
            const partner = yield transaction.$get('partner');
            if (!partner)
                throw new Error('Partner not found for transaction');
            retry.count = 0;
            return yield Vendor_1.VendorPublisher.publishEventForRetryPowerPurchaseWithNewVendor({
                meter: meter,
                partner: partner,
                transactionId: transaction.id,
                superAgent: newVendor,
                user: {
                    name: user.name,
                    email: user.email,
                    address: user.address,
                    phoneNumber: user.phoneNumber,
                },
                newVendor,
            });
        });
    }
    static processVendRequest(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield data.transaction.$get('user');
            if (!user)
                throw new Error('User not found for transaction');
            const _data = {
                reference: data.transaction.reference,
                meterNumber: data.meterNumber,
                disco: data.disco,
                vendType: data.vendType,
                amount: data.transaction.amount,
                phone: data.phone,
                email: user.email,
                accessToken: data.accessToken
            };
            switch (data.transaction.superagent) {
                case "BAXI":
                    return yield Vendor_service_1.default.baxiVendToken(_data);
                case "BUYPOWERNG":
                    return yield Vendor_service_1.default.buyPowerVendToken(_data).catch((e) => e);
                case "IRECHARGE":
                    return yield Vendor_service_1.default.irechargeVendToken(_data);
                default:
                    throw new Error("Invalid superagent");
            }
        });
    }
    static requeryTransactionFromVendor(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (transaction.superagent) {
                case 'BAXI':
                    return yield Vendor_service_1.default.baxiRequeryTransaction({ reference: transaction.reference });
                case 'BUYPOWERNG':
                    return yield Vendor_service_1.default.buyPowerRequeryTransaction({ reference: transaction.reference });
                case 'IRECHARGE':
                    return yield Vendor_service_1.default.irechargeRequeryTransaction({ accessToken: transaction.irecharge_token, serviceType: 'power' });
                default:
                    throw new Error('Unsupported superagent');
            }
        });
    }
    static getNextBestVendorForVendRePurchase(currentVendor) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Implement logic to calculate best rates from different vendors
            const nextVendor = {
                BUYPOWERNG: 'BAXI',
                BAXI: 'IRECHARGE',
                IRECHARGE: 'BUYPOWERNG'
            };
            return nextVendor[currentVendor];
        });
    }
}
exports.TokenHandlerUtil = TokenHandlerUtil;
class TokenHandler extends Interface_1.Registry {
    static retryPowerPurchaseWithNewVendor(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield Transaction_service_1.default.viewSingleTransaction(data.transactionId);
            if (!transaction) {
                throw new Error(`Error fetching transaction with id ${data.transactionId}`);
            }
            if (!transaction.bankRefId) {
                throw new Error('BankRefId not found');
            }
            yield Transaction_service_1.default.updateSingleTransaction(transaction.id, { superagent: data.newVendor });
            const transactionEventService = new Event_service_1.default.transactionEventService(transaction, data.meter, data.newVendor, data.partner.email);
            yield transactionEventService.addPowerPurchaseInitiatedEvent(transaction.bankRefId, transaction.amount);
            yield Vendor_1.VendorPublisher.publishEventForInitiatedPowerPurchase({
                meter: data.meter,
                user: data.user,
                partner: data.partner,
                transactionId: transaction.id,
                superAgent: data.newVendor,
            });
        });
    }
    static handleTokenRequest(data) {
        var _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function* () {
            console.log({
                log: 'New token request',
                currentVendor: data.superAgent
            });
            const transaction = yield Transaction_service_1.default.viewSingleTransaction(data.transactionId);
            if (!transaction) {
                Logger_1.default.error(`Error fetching transaction with id ${data.transactionId}`);
                return;
            }
            const { user, meter, partner } = transaction;
            // if (transaction.superagent === 'IRECHARGE') {
            //     throw 'Unsupported superagent'
            // }
            // Purchase token from vendor
            const tokenInfo = yield TokenHandlerUtil.processVendRequest({
                transaction: transaction,
                meterNumber: meter.meterNumber,
                disco: transaction.disco,
                vendType: meter.vendType,
                phone: user.phoneNumber,
                accessToken: transaction.irecharge_token
            });
            const eventMessage = {
                meter: {
                    meterNumber: meter.meterNumber,
                    disco: transaction.disco,
                    vendType: meter.vendType,
                    id: meter.id,
                },
                transactionId: transaction.id,
                error: {
                    code: (tokenInfo instanceof axios_1.AxiosError
                        ? (_c = (_b = tokenInfo.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.responseCode
                        : undefined),
                    cause: Interface_1.TransactionErrorCause.UNKNOWN,
                },
            };
            const transactionEventService = new TransactionEvent_service_1.default(transaction, eventMessage.meter, data.superAgent, partner.email);
            yield transactionEventService.addGetTransactionTokenFromVendorInitiatedEvent();
            yield transactionEventService.addVendElectricityRequestedFromVendorEvent();
            const responseFromIrecharge = tokenInfo;
            const transactionTimedOutFromIrecharge = responseFromIrecharge.source === 'IRECHARGE' ? ['15', '43'].includes(responseFromIrecharge.status) : false;
            // Check if error occured while purchasing token
            // Note that Irecharge api always returns 200, even when an error occurs
            if (tokenInfo instanceof Error) {
                if (tokenInfo instanceof axios_1.AxiosError) {
                    /**
                     * Note that these error codes are only valid for Buypower
                     * 202 - Timeout / Transaction is processing
                     * 501 - Maintenance error
                     * 500 - Unexpected error - Please requery
                     */
                    // If error is due to timeout, trigger event to requery transactioPn later
                    let responseCode = (_d = tokenInfo.response) === null || _d === void 0 ? void 0 : _d.data.responseCode;
                    responseCode = tokenInfo.message === 'Transaction timeout' ? 202 : responseCode;
                    if (tokenInfo.source === 'BUYPOWERNG' && [202, 500, 501].includes(responseCode)) {
                        return yield TokenHandlerUtil.triggerEventToRequeryTransactionTokenFromVendor({
                            eventService: transactionEventService,
                            eventData: Object.assign(Object.assign({}, eventMessage), { error: { code: responseCode, cause: (_e = TransactionErrorCodeAndCause[responseCode]) !== null && _e !== void 0 ? _e : Interface_1.TransactionErrorCause.TRANSACTION_TIMEDOUT } }),
                            retryCount: 1,
                            superAgent: data.superAgent,
                            tokenInResponse: null,
                            transactionTimedOutFromBuypower: false,
                        });
                    }
                    // This doesn't account for other errors that may arise from other Providers
                    // Other errors (4xx ...) occured while purchasing token 
                }
                // Transaction failed, trigger event to retry transaction from scratch
                /* Commmented out because no transaction should be allowed to fail, any failed transaction should be retried with a different vendor
                await transactionEventService.addTokenRequestFailedNotificationToPartnerEvent();
                return await VendorPublisher.publishEventForFailedTokenRequest(eventMessage); */
                return yield TokenHandlerUtil.triggerEventToRetryTransactionWithNewVendor({ meter: data.meter, transaction, transactionEventService });
            }
            /**
             * Vend token request didn't return an error, but there are two possible outcomes in this case
             *
             * 1. Transaction timedout
             * 2. No token was found in the response
             * 3. Transaction was successful and a token was found in the response
             *
             * In the case of 1 and 2, we need to requery the transaction at intervals
             */
            let transactionTimedOutFromBuypower = tokenInfo.source === 'BUYPOWERNG' ? tokenInfo.data.responseCode == 202 : false; // TODO: Add check for when transaction timeout from baxi
            let tokenInResponse = null;
            if (tokenInfo.source === 'BUYPOWERNG') {
                tokenInResponse = tokenInfo.data.responseCode !== 202 ? tokenInfo.data.token : null;
            }
            else if (tokenInfo.source === 'BAXI') {
                tokenInResponse = tokenInfo.data.rawOutput.token;
            }
            else if (tokenInfo.source === 'IRECHARGE') {
                tokenInResponse = tokenInfo.meter_token;
            }
            // If Transaction timedout - Requery the transaction at intervals
            transactionTimedOutFromBuypower = TEST_FAILED !== null && TEST_FAILED !== void 0 ? TEST_FAILED : transactionTimedOutFromBuypower;
            if (transactionTimedOutFromBuypower || !tokenInResponse || transactionTimedOutFromIrecharge) {
                return yield TokenHandlerUtil.triggerEventToRequeryTransactionTokenFromVendor({
                    eventService: transactionEventService,
                    eventData: eventMessage,
                    transactionTimedOutFromBuypower,
                    tokenInResponse,
                    superAgent: transaction.superagent,
                    retryCount: 1,
                });
            }
            // Token purchase was successful
            // And token was found in request
            // Add and publish token received event
            yield transactionEventService.addTokenReceivedEvent(tokenInResponse);
            return yield Vendor_1.VendorPublisher.publishEventForTokenReceivedFromVendor({
                transactionId: transaction.id,
                user: {
                    name: user.name,
                    email: user.email,
                    address: user.address,
                    phoneNumber: user.phoneNumber,
                },
                partner: {
                    email: partner.email,
                },
                meter: {
                    id: meter.id,
                    meterNumber: meter.meterNumber,
                    disco: transaction.disco,
                    vendType: meter.vendType,
                    token: tokenInResponse,
                },
            });
        });
    }
    static handleTokenReceived(data) {
        var _b;
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield Transaction_service_1.default.viewSingleTransaction(data.transactionId);
            if (!transaction) {
                throw new Error(`Error fetching transaction with id ${data.transactionId}`);
            }
            // Check if transaction is already complete
            if (transaction.status === Transaction_model_1.Status.COMPLETE) {
                throw new Error(`Transaction with id ${data.transactionId} is already complete`);
            }
            // Requery transaction from provider and update transaction status
            const requeryResult = yield TokenHandlerUtil.requeryTransactionFromVendor(transaction);
            const requeryResultFromBuypower = requeryResult;
            const requeryResultFromBaxi = requeryResult;
            const requeryResultFromIrecharge = requeryResult;
            const transactionSuccessFromBuypower = requeryResultFromBuypower.source === 'BUYPOWERNG' ? requeryResultFromBuypower.responseCode === 200 : false;
            const transactionSuccessFromBaxi = requeryResultFromBaxi.source === 'BAXI' ? requeryResultFromBaxi.responseCode === 200 : false;
            const transactionSuccessFromIrecharge = requeryResultFromIrecharge.source === 'IRECHARGE' ? requeryResultFromIrecharge.status === '00' : false;
            const transactionSuccess = transactionSuccessFromBuypower || transactionSuccessFromBaxi || transactionSuccessFromIrecharge;
            if (!transactionSuccess) {
                throw new Error(`Error requerying transaction with id ${data.transactionId}`);
            }
            // If successful, check if a power unit exists for the transaction, if none exists, create one
            let powerUnit = yield PowerUnit_service_1.default.viewSinglePowerUnitByTransactionId(data.transactionId);
            // BuyPower returnes the same token on test mode, this causes a conflict when trying to update the power unit
            data.meter.token = Constants_1.NODE_ENV === 'development' ? data.meter.token === '0000-0000-0000-0000-0000' ? (0, Helper_1.generateRandomToken)() : data.meter.token : data.meter.token;
            const discoLogo = (_b = Constants_1.DISCO_LOGO[data.meter.disco]) !== null && _b !== void 0 ? _b : Constants_1.LOGO_URL;
            powerUnit = powerUnit
                ? yield PowerUnit_service_1.default.updateSinglePowerUnit(powerUnit.id, {
                    token: data.meter.token,
                    transactionId: data.transactionId,
                })
                : yield PowerUnit_service_1.default.addPowerUnit({
                    id: (0, uuid_1.v4)(),
                    transactionId: data.transactionId,
                    disco: data.meter.disco,
                    discoLogo,
                    amount: transaction.amount,
                    meterId: data.meter.id,
                    superagent: "BUYPOWERNG",
                    token: data.meter.token,
                    tokenNumber: 0,
                    tokenUnits: "0",
                    address: transaction.meter.address,
                });
            return yield Transaction_service_1.default.updateSingleTransaction(data.transactionId, {
                status: Transaction_model_1.Status.COMPLETE,
                powerUnitId: powerUnit.id,
            });
        });
    }
    static requeryTransactionForToken(data) {
        var _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            retry.count = data.retryCount;
            console.log({
                retryCount: data.retryCount
            });
            // Check if token has been found
            const transaction = yield Transaction_service_1.default.viewSingleTransaction(data.transactionId);
            if (!transaction) {
                Logger_1.default.error("Transaction not found");
                return;
            }
            const user = yield transaction.$get('user');
            const meter = yield transaction.$get('meter');
            const partner = yield transaction.$get('partner');
            if (!user || !meter || !partner) {
                throw new Error("Transaction  required relations not found");
            }
            const transactionEventService = new TransactionEvent_service_1.default(transaction, data.meter, data.superAgent, partner.email);
            yield transactionEventService.addGetTransactionTokenFromVendorInitiatedEvent();
            yield Vendor_1.VendorPublisher.publishEventForGetTransactionTokenFromVendorInitiated({
                transactionId: transaction.id,
                meter: data.meter,
                timeStamp: new Date(),
                superAgent: data.superAgent
            });
            // Requery transaction from provider and update transaction status
            /**
             * When requerying a transaction, it is important to note that,
             * the response code for 'Processing transaction' is 201,
             * this is different for the 'Processing transaction' when we initiate the purchase at the first instance.
             *
             * When initiating a purchase at the first instance and the transaction is being processed
             * or timedout, the response code is 202.
             *
             * When requerying a transaction, the response code is 201.
             */
            const requeryResult = yield TokenHandlerUtil.requeryTransactionFromVendor(transaction);
            const requeryResultFromBuypower = requeryResult;
            const requeryResultFromBaxi = requeryResult;
            const requeryResultFromIrecharge = requeryResult;
            const transactionSuccessFromBuypower = requeryResultFromBuypower.source === 'BUYPOWERNG' ? requeryResultFromBuypower.responseCode === 200 : false;
            const transactionSuccessFromBaxi = requeryResultFromBaxi.source === 'BAXI' ? requeryResultFromBaxi.responseCode === 200 : false;
            const transactionSuccessFromIrecharge = requeryResultFromIrecharge.source === 'IRECHARGE' ? requeryResultFromIrecharge.status === '00' : false;
            const transactionSuccess = TEST_FAILED ? false : (transactionSuccessFromBuypower || transactionSuccessFromBaxi || transactionSuccessFromIrecharge);
            if (!transactionSuccess) {
                /**
                 * Transaction may be unsuccessful but it doesn't mean it has failed
                 * The transaction can still be pending
                 * If transaction failed, switch to a new vendor
                 */
                let requeryFromNewVendor = false;
                let requeryFromSameVendor = false;
                let error = { code: 202, cause: Interface_1.TransactionErrorCause.UNKNOWN };
                if (requeryResult.source === 'BUYPOWERNG') {
                    let transactionFailed = requeryResultFromBuypower.responseCode === 202;
                    transactionFailed = TEST_FAILED ? retry.count > retry.retryCountBeforeSwitchingVendor : transactionFailed; // TOGGLE - Will simulate failed buypower transaction
                    if (transactionFailed)
                        requeryFromNewVendor = true;
                    else {
                        requeryFromSameVendor = true;
                        error.code = requeryResultFromBuypower.responseCode;
                        error.cause = requeryResultFromBuypower.responseCode === 201 ? Interface_1.TransactionErrorCause.TRANSACTION_TIMEDOUT : Interface_1.TransactionErrorCause.TRANSACTION_FAILED;
                    }
                }
                else if (requeryResult.source === 'BAXI') {
                    // TODO: Add logic to handle baxi requery
                }
                else if (requeryResult.source === 'IRECHARGE') {
                    console.log(`
                
                    SHIFTING
                
                `);
                    let transactionFailed = !['00', '15', '43'].includes(requeryResultFromIrecharge.status);
                    transactionFailed = TEST_FAILED ? retry.count > retry.retryCountBeforeSwitchingVendor : transactionFailed; // TOGGLE - Will simulate failed irecharge transaction
                    if (transactionFailed)
                        requeryFromNewVendor = true;
                    else {
                        requeryFromSameVendor = true;
                        error.code = requeryResultFromIrecharge.status === '00' ? 200 : 202;
                        error.cause = requeryResultFromIrecharge.status === '00' ? Interface_1.TransactionErrorCause.TRANSACTION_TIMEDOUT : Interface_1.TransactionErrorCause.TRANSACTION_FAILED;
                    }
                }
                Logger_1.default.error(`Error requerying transaction with id ${data.transactionId} `);
                if (requeryFromNewVendor) {
                    return yield TokenHandlerUtil.triggerEventToRetryTransactionWithNewVendor({ meter, transaction, transactionEventService });
                }
                if (requeryFromSameVendor) {
                    return yield TokenHandlerUtil.triggerEventToRequeryTransactionTokenFromVendor({
                        eventService: transactionEventService,
                        eventData: {
                            meter: data.meter,
                            transactionId: data.transactionId,
                            error: error
                        },
                        retryCount: data.retryCount + 1,
                        superAgent: data.superAgent,
                        tokenInResponse: null,
                        transactionTimedOutFromBuypower: false,
                    });
                }
            }
            let token = undefined;
            if (requeryResult.source === 'BUYPOWERNG')
                token = (_b = requeryResultFromBuypower.data) === null || _b === void 0 ? void 0 : _b.token;
            else if (requeryResult.source === 'BAXI')
                token = (_c = requeryResultFromBaxi.data) === null || _c === void 0 ? void 0 : _c.rawOutput.token;
            else if (requeryResult.source === 'IRECHARGE')
                token = requeryResultFromIrecharge.token;
            if (!token) {
                return yield TokenHandlerUtil.triggerEventToRequeryTransactionTokenFromVendor({
                    eventService: transactionEventService,
                    eventData: {
                        meter: {
                            meterNumber: meter.meterNumber,
                            disco: transaction.disco,
                            vendType: meter.vendType,
                            id: meter.id,
                        },
                        transactionId: transaction.id,
                        error: {
                            code: 202,
                            cause: Interface_1.TransactionErrorCause.NO_TOKEN_IN_RESPONSE,
                        },
                    },
                    retryCount: data.retryCount + 1,
                    superAgent: data.superAgent,
                    tokenInResponse: null,
                    transactionTimedOutFromBuypower: false,
                });
            }
            yield transactionEventService.addTokenReceivedEvent(token);
            yield Vendor_1.VendorPublisher.publishEventForTokenReceivedFromVendor({
                meter: Object.assign(Object.assign({}, data.meter), { token }),
                transactionId: transaction.id,
                user: {
                    name: transaction.user.name,
                    email: transaction.user.email,
                    address: transaction.user.address,
                    phoneNumber: transaction.user.phoneNumber,
                },
                partner: {
                    email: transaction.partner.email,
                },
            });
        });
    }
}
_a = TokenHandler;
TokenHandler.registry = {
    [Constants_2.TOPICS.POWER_PURCHASE_INITIATED_BY_CUSTOMER]: _a.handleTokenRequest,
    [Constants_2.TOPICS.TOKEN_RECIEVED_FROM_VENDOR]: _a.handleTokenReceived,
    [Constants_2.TOPICS.GET_TRANSACTION_TOKEN_FROM_VENDOR_RETRY]: _a.requeryTransactionForToken,
    [Constants_2.TOPICS.POWER_PURCHASE_INITIATED_BY_CUSTOMER_REQUERY]: _a.requeryTransactionForToken,
    [Constants_2.TOPICS.RETRY_PURCHASE_FROM_NEW_VENDOR]: _a.retryPowerPurchaseWithNewVendor
};
class TokenConsumer extends Consumer_1.default {
    constructor() {
        const messageProcessor = new MessageProcessor_1.default(TokenHandler.registry, "TOKEN_CONSUMER");
        super(messageProcessor);
    }
}
exports.default = TokenConsumer;
