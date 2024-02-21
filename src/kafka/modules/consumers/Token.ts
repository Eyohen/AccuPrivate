import { AxiosError } from "axios";
import { Status } from "../../../models/Transaction.model";
import Meter from "../../../models/Meter.model";
import Transaction from "../../../models/Transaction.model";
import PowerUnitService from "../../../services/PowerUnit.service";
import TransactionService from "../../../services/Transaction.service";
import TransactionEventService from "../../../services/TransactionEvent.service";
import { DISCO_LOGO, LOGO_URL, MAX_REQUERY_PER_VENDOR, NODE_ENV } from "../../../utils/Constants";
import logger from "../../../utils/Logger";
import { TOPICS } from "../../Constants";
import { VendorPublisher } from "../publishers/Vendor";
import ConsumerFactory from "../util/Consumer";
import {
    MeterInfo,
    PublisherEventAndParameters,
    Registry,
    TransactionErrorCause,
    VendorRetryRecord,
} from "../util/Interface";
import MessageProcessor from "../util/MessageProcessor";
import { v4 as uuidv4 } from "uuid";
import EventService from "../../../services/Event.service";
import VendorService, { ElectricityPurchaseResponse, ElectricityRequeryResponse, SuccessResponseForBuyPowerRequery, Vendor } from "../../../services/VendorApi.service";
import { generateRandomToken } from "../../../utils/Helper";
import ProductService from "../../../services/Product.service";
import { CustomError } from "../../../utils/Errors";
import VendorProductService from "../../../services/VendorProduct.service";
import VendorModelService from "../../../services/Vendor.service"
import { BaxiRequeryResultForPurchase, BaxiSuccessfulPuchaseResponse } from "../../../services/VendorApi.service/Baxi/Config";
import { error } from "console";
import test from "node:test";

interface EventMessage {
    meter: {
        meterNumber: string;
        disco: Transaction["disco"];
        vendType: Meter["vendType"];
        id: string;
    };
    transactionId: string;
}

interface TriggerRequeryTransactionTokenProps {
    eventService: TransactionEventService;
    eventData: EventMessage & {
        error: {
            cause: TransactionErrorCause;
            code: number;
        }
    };
    tokenInResponse: string | null;
    transactionTimedOutFromBuypower: boolean;
    superAgent: Transaction['superagent'];
    retryCount: number;
    vendorRetryRecord: VendorRetryRecord
}

interface TokenPurchaseData {
    transaction: Transaction;
    meterNumber: string,
    disco: string,
    vendType: 'PREPAID' | 'POSTPAID',
    phone: string,
    accessToken: string
}

interface ProcessVendRequestReturnData extends Record<Transaction['superagent'], Record<string, any>> {
    'BAXI': Awaited<ReturnType<typeof VendorService.baxiVendToken>>
    'BUYPOWERNG': Awaited<ReturnType<typeof VendorService.buyPowerVendToken>>,
    'IRECHARGE': Awaited<ReturnType<typeof VendorService.irechargeVendToken>>
}

const retry = {
    count: 0,
    limit: 2,
    limitToStopRetryingWhenTransactionIsSuccessful: 5,
    retryCountBeforeSwitchingVendor: 2,
}

const TEST_FAILED = NODE_ENV === 'production' ? false : true // TOGGLE - Will simulate failed transaction

const TransactionErrorCodeAndCause = {
    501: TransactionErrorCause.MAINTENANCE_ACCOUNT_ACTIVATION_REQUIRED,
    500: TransactionErrorCause.UNEXPECTED_ERROR,
    202: TransactionErrorCause.TRANSACTION_TIMEDOUT
}


export function getCurrentWaitTimeForRequeryEvent(retryCount: number) {
    // Use geometric progression  calculate wait time, where R = 2
    const waitTime = 2 ** (retryCount - 1)
    return waitTime < 5 ? 5 : waitTime
}

type TransactionWithProductId = Exclude<Transaction, 'productCodeId'> & { productCodeId: NonNullable<Transaction['productCodeId']> }
export class TokenHandlerUtil {
    static async triggerEventToRequeryTransactionTokenFromVendor({
        eventService,
        eventData,
        transactionTimedOutFromBuypower,
        tokenInResponse,
        retryCount,
        vendorRetryRecord,
        superAgent
    }: TriggerRequeryTransactionTokenProps) {
        // Check if the transaction has hit the requery limit
        // If yes, flag transaction
        if (retryCount >= MAX_REQUERY_PER_VENDOR) {
            logger.info(`Flagged transaction with id ${eventData.transactionId} after hitting requery limit`, {
                meta: { transactionId: eventData.transactionId }
            })
            return await TransactionService.updateSingleTransaction(eventData.transactionId, { status: Status.FLAGGED })
        }

        /**
         * Not all transactions that are requeried are due to timeout
         * Some transactions are requeried because the transaction is still processing
         * or an error occured while processing the transaction
         *
         * These errors include:
         * 202 - Timeout / Transaction is processing
         * 501 - Maintenance error
         * 500 - Unexpected CustomError
         */
        transactionTimedOutFromBuypower && (await eventService.addTokenRequestTimedOutEvent());
        !tokenInResponse && (await eventService.addTokenRequestFailedNotificationToPartnerEvent());

        const _eventMessage = {
            ...eventData,
            error: {
                code: 202,
                cause: transactionTimedOutFromBuypower
                    ? TransactionErrorCause.TRANSACTION_TIMEDOUT
                    : TransactionErrorCause.NO_TOKEN_IN_RESPONSE,
            },
        };

        logger.info(
            `Retrying transaction with id ${eventData.transactionId} from vendor`,
            {
                meta: { transactionId: eventData.transactionId }
            });

        await eventService.addGetTransactionTokenRequestedFromVendorRetryEvent(_eventMessage.error, retryCount);
        const eventMetaData = {
            transactionId: eventData.transactionId,
            meter: eventData.meter,
            error: eventData.error,
            timeStamp: new Date(),
            retryCount,
            superAgent,
            vendorRetryRecord,
            waitTime: getCurrentWaitTimeForRequeryEvent(retryCount)
        };

        // Start timer to requery transaction at intervals
        async function countDownTimer(time: number) {
            for (let i = time; i > 0; i--) {
                setTimeout(() => {
                    logger.info(`Retrying transaction ${i} seconds`, {
                        meta: { transactionId: eventData.transactionId }
                    })
                }, (time - i) * 1000)
            }
        }
        countDownTimer(eventMetaData.waitTime);

        // Publish event in increasing intervals of seconds i.e 1, 2, 4, 8, 16, 32, 64, 128, 256, 512
        // TODO: Use an external service to schedule this task
        setTimeout(async () => {
            logger.info('Retrying transaction from vendor', {
                meta: { transactionId: eventData.transactionId }
            })
            await VendorPublisher.publishEventForGetTransactionTokenRequestedFromVendorRetry(
                eventMetaData,
            );
        }, eventMetaData.waitTime * 1000);
    }

    static async triggerEventToRetryTransactionWithNewVendor(
        {
            transaction, transactionEventService, meter, vendorRetryRecord
        }: {
            transaction: TransactionWithProductId,
            transactionEventService: TransactionEventService,
            meter: MeterInfo & { id: string },
            vendorRetryRecord: VendorRetryRecord
        }
    ) {
        logger.info('Retrying transaction with new vendor', { meta: { transactionId: transaction.id } })
        const meta = {
            transactionId: transaction.id,
        }
        // Attempt purchase from new vendor
        if (!transaction.bankRefId) throw new CustomError('BankRefId not found', meta)

        const retryRecord = transaction.retryRecord

        // Make sure to use the same vendor thrice before switching to another vendor
        const currentVendor = retryRecord[retryRecord.length - 1]
        console.log({ currentVendor, retryRecord })
        let useCurrentVendor = false
        if (currentVendor.vendor === transaction.superagent) {
            if (currentVendor.retryCount <= 3) {
                // Update the retry record in the transaction
                // Get the last record where this vendor was used
                const lastRecord = retryRecord[retryRecord.length - 1]
                lastRecord.retryCount = lastRecord.retryCount + 1

                // Update the transaction
                await TransactionService.updateSingleTransaction(transaction.id, { retryRecord })

                useCurrentVendor = true
                logger.info('Using current vendor', meta)
            }
        }
        const newVendor = useCurrentVendor ? currentVendor.vendor : await TokenHandlerUtil.getNextBestVendorForVendRePurchase(transaction.productCodeId, transaction.superagent, transaction.previousVendors, parseFloat(transaction.amount))
        await transactionEventService.addPowerPurchaseRetryWithNewVendor({ bankRefId: transaction.bankRefId, currentVendor: transaction.superagent, newVendor })

        const user = await transaction.$get('user')
        if (!user) throw new CustomError('User not found for transaction', meta)

        const partner = await transaction.$get('partner')
        if (!partner) throw new CustomError('Partner not found for transaction', meta)

        retry.count = 0
        await transaction.update({ previousVendors: [...transaction.previousVendors, newVendor] })
        return await VendorPublisher.publishEventForRetryPowerPurchaseWithNewVendor({
            meter: meter,
            partner: partner,
            transactionId: transaction.id,
            superAgent: newVendor,
            user: {
                name: user.name as string,
                email: user.email,
                address: user.address,
                phoneNumber: user.phoneNumber,
            },
            newVendor,
        })
    }

    static async processVendRequest<T extends Vendor>(data: TokenPurchaseData) {
        const user = await data.transaction.$get('user')
        if (!user) throw new CustomError('User not found for transaction', {
            transactionId: data.transaction.id
        })

        const _data = {
            reference: data.transaction.superagent === 'IRECHARGE' ? data.transaction.vendorReferenceId : data.transaction.reference,
            meterNumber: data.meterNumber,
            disco: data.disco,
            vendType: data.vendType,
            amount: data.transaction.amount,
            phone: data.phone,
            email: user.email,
            accessToken: data.transaction.irechargeAccessToken,
            transactionId: data.transaction.id
        }

        if (!_data.accessToken && data.transaction.superagent === 'IRECHARGE') {
            logger.warn('No access token found for irecharge meter validation', {
                transactionId: data.transaction.id
            })

            logger.info('Validating meter', { transactionId: data.transaction.id })
            const meterValidationResult = await VendorService.irechargeValidateMeter(_data.disco, _data.meterNumber, data.transaction.vendorReferenceId).catch((error) => {
                throw new CustomError('Error validating meter', {
                    transactionId: data.transaction.id,
                })
            })

            if (!meterValidationResult) throw new CustomError('Error validating meter', {
                transactionId: data.transaction.id,
            })

            _data.accessToken = meterValidationResult.access_token
            console.log({ meterValidationResult, info: 'New meter validation result' })
            await TransactionService.updateSingleTransaction(data.transaction.id, { irechargeAccessToken: meterValidationResult.access_token })
            logger.info('Generated access token for irecharge meter validation', { transactionId: data.transaction.id })
        }

        switch (data.transaction.superagent) {
            case "BAXI":
                return await VendorService.purchaseElectricity({ data: _data, vendor: 'BAXI' })
            case "BUYPOWERNG":
                return await VendorService.purchaseElectricity({ data: _data, vendor: 'BUYPOWERNG' }).catch((e) => e)
            case "IRECHARGE":
                return await VendorService.purchaseElectricity({ data: _data, vendor: 'IRECHARGE' })
            default:
                throw new CustomError("Invalid superagent", {
                    transactionId: data.transaction.id
                });
        }
    }

    static async requeryTransactionFromVendor(transaction: Transaction) {
        switch (transaction.superagent) {
            case 'BAXI':
                return await VendorService.baxiRequeryTransaction({ reference: transaction.reference, transactionId: transaction.id })
            case 'BUYPOWERNG':
                return await VendorService.buyPowerRequeryTransaction({ reference: transaction.reference, transactionId: transaction.id })
            case 'IRECHARGE':
                return await VendorService.irechargeRequeryTransaction({ accessToken: transaction.irechargeAccessToken, serviceType: 'power', transactionId: transaction.id })
            default:
                throw new CustomError('Unsupported superagent', {
                    transactionId: transaction.id
                })
        }
    }

    static async getNextBestVendorForVendRePurchase(productCodeId: NonNullable<Transaction['productCodeId']>, currentVendor: Transaction['superagent'], previousVendors: Transaction['previousVendors'] = [], amount: number): Promise<Transaction['superagent']> {
        const product = await ProductService.viewSingleProduct(productCodeId)
        if (!product) throw new CustomError('Product code not found')

        const vendorProducts = await product.$get('vendorProducts')
        // Populate all te vendors
        const vendors = await Promise.all(vendorProducts.map(async vendorProduct => {
            const vendor = await vendorProduct.$get('vendor')
            if (!vendor) throw new CustomError('Vendor not found')
            vendorProduct.vendor = vendor
            return vendor
        }))

        // Check other vendors, sort them according to their commission rates
        // If the current vendor is the vendor with the highest commission rate, then switch to the vendor with the next highest commission rate
        // If the next vendor has been used before, switch to the next vendor with the next highest commission rate
        // If all the vendors have been used before, switch to the vendor with the highest commission rate

        const sortedVendorProductsAccordingToCommissionRate = vendorProducts.sort((a, b) => ((b.commission * amount) + b.bonus) - ((a.commission * amount) + a.bonus))
        const vendorRates = sortedVendorProductsAccordingToCommissionRate.map(vendorProduct => {
            const vendor = vendorProduct.vendor
            if (!vendor) throw new CustomError('Vendor not found')
            return {
                vendorName: vendor.name,
                commission: vendorProduct.commission,
                bonus: vendorProduct.bonus
            }
        })

        const sortedOtherVendors = vendorRates.filter(vendorRate => vendorRate.vendorName !== currentVendor)

        nextBestVendor: for (const vendorRate of sortedOtherVendors) {
            if (!previousVendors.includes(vendorRate.vendorName)) return vendorRate.vendorName as Transaction['superagent']
        }

        if (previousVendors.length === vendors.length) {
            // If all vendors have been used before, switch to the vendor with the highest commission rate
            return vendorRates.sort((a, b) => ((b.commission * amount) + b.bonus) - ((a.commission * amount) + a.bonus))[0].vendorName as Transaction['superagent']
        }

        // If the current vendor is the vendor with the highest commission rate, then switch to the vendor with the next highest commission rate
        return sortedOtherVendors[0].vendorName as Transaction['superagent']
    }

    static async getSortedVendorsAccordingToCommissionRate(productCodeId: NonNullable<Transaction['productCodeId']>, amount: number): Promise<Transaction['superagent'][]> {
        const product = await ProductService.viewSingleProduct(productCodeId)
        if (!product) throw new CustomError('Product code not found')

        const vendorProducts = await product.$get('vendorProducts')
        // Populate all te vendors
        const vendors = await Promise.all(vendorProducts.map(async vendorProduct => {
            const vendor = await vendorProduct.$get('vendor')
            if (!vendor) throw new CustomError('Vendor not found')
            vendorProduct.vendor = vendor
            return vendor
        }))

        // Check other vendors, sort them according to their commission rates
        // If the current vendor is the vendor with the highest commission rate, then switch to the vendor with the next highest commission rate
        // If the next vendor has been used before, switch to the next vendor with the next highest commission rate
        // If all the vendors have been used before, switch to the vendor with the highest commission rate

        const sortedVendorProductsAccordingToCommissionRate = vendorProducts.sort((a, b) => ((b.commission * amount) + b.bonus) - ((a.commission * amount) + a.bonus))
        const vendorRates = sortedVendorProductsAccordingToCommissionRate.map(vendorProduct => {
            const vendor = vendorProduct.vendor
            if (!vendor) throw new CustomError('Vendor not found')
            return {
                vendorName: vendor.name,
                commission: vendorProduct.commission,
                bonus: vendorProduct.bonus
            }
        })

        return vendorRates.map(vendorRate => vendorRate.vendorName as Transaction['superagent'])
    }

    static async getBestVendorForPurchase(productCodeId: NonNullable<Transaction['productCodeId']>, amount: number): Promise<Transaction['superagent']> {
        const product = await ProductService.viewSingleProduct(productCodeId)
        if (!product) throw new CustomError('Product code not found')

        const vendorProducts = await product.$get('vendorProducts')
        // Populate all te vendors
        const vendors = await Promise.all(vendorProducts.map(async vendorProduct => {
            const vendor = await vendorProduct.$get('vendor')
            if (!vendor) throw new CustomError('Vendor not found')
            vendorProduct.vendor = vendor
            return vendor
        }))

        logger.info('Getting best vendor for purchase')
        // Check other vendors, sort them according to their commission rates
        // If the current vendor is the vendor with the highest commission rate, then switch to the vendor with the next highest commission rate
        // If the next vendor has been used before, switch to the next vendor with the next highest commission rate
        // If all the vendors have been used before, switch to the vendor with the highest commission rate

        const sortedVendorProductsAccordingToCommissionRate = vendorProducts.sort((a, b) => ((b.commission * amount) + b.bonus) - ((a.commission * amount) + a.bonus))

        const vendorRates = sortedVendorProductsAccordingToCommissionRate.map(vendorProduct => {
            const vendor = vendorProduct.vendor
            if (!vendor) throw new CustomError('Vendor not found')
            return {
                vendorName: vendor.name,
                commission: vendorProduct.commission,
                bonus: vendorProduct.bonus,
                value: (vendorProduct.commission * amount) + vendorProduct.bonus
            }
        })

        console.log({ vendorRates })
        return vendorRates[0].vendorName as Transaction['superagent']
    }
}


class TokenHandler extends Registry {
    private static async retryPowerPurchaseWithNewVendor(data: PublisherEventAndParameters[TOPICS.RETRY_PURCHASE_FROM_NEW_VENDOR]) {
        const transaction = await TransactionService.viewSingleTransaction(data.transactionId);
        if (!transaction) {
            throw new CustomError(`CustomError fetching transaction with id ${data.transactionId}`, {
                transactionId: data.transactionId
            });
        }
        if (!transaction.bankRefId) {
            throw new CustomError('BankRefId not found', {
                transactionId: data.transactionId
            })
        }

        await TransactionService.updateSingleTransaction(transaction.id, { superagent: data.newVendor })
        const transactionEventService = new EventService.transactionEventService(transaction, data.meter, data.newVendor, data.partner.email);
        await transactionEventService.addPowerPurchaseInitiatedEvent(transaction.bankRefId, transaction.amount);
        await VendorPublisher.publishEventForInitiatedPowerPurchase({
            meter: data.meter,
            user: data.user,
            partner: data.partner,
            transactionId: transaction.id,
            superAgent: data.newVendor,
            vendorRetryRecord: transaction.retryRecord[transaction.retryRecord.length - 1]
        })
    }

    private static async handleTokenRequest(
        data: PublisherEventAndParameters[TOPICS.POWER_PURCHASE_INITIATED_BY_CUSTOMER],
    ) {
        try {

            console.log({ log: 'New token request', currentVendor: data.superAgent })

            const transaction = await TransactionService.viewSingleTransaction(
                data.transactionId,
            );
            if (!transaction) {
                logger.error(
                    `CustomError fetching transaction with id ${data.transactionId}`,
                    {
                        meta: {
                            transactionId: data.transactionId
                        }
                    }
                );
                return;
            }

            const { user, meter, partner } = transaction;

            const vendor = await VendorModelService.viewSingleVendorByName(data.superAgent)
            if (!vendor) throw new CustomError('Vendor not found')

            const product = await ProductService.viewSingleProductByMasterProductCode(transaction.disco)
            if (!product) throw new CustomError('Product not found')

            const vendorProduct = await VendorProductService.viewSingleVendorProductByVendorIdAndProductId(vendor.id, product.id)
            if (!vendorProduct) throw new CustomError('Vendor product not found')

            const disco = vendorProduct.schemaData.code
            const logMeta = { meta: { transactionId: data.transactionId } }
            logger.info('Processing token request', logMeta);
            // Purchase token from vendor
            const tokenInfo = await TokenHandlerUtil.processVendRequest({
                transaction: transaction as TokenPurchaseData['transaction'],
                meterNumber: meter.meterNumber,
                disco: disco,
                vendType: meter.vendType,
                phone: user.phoneNumber,
                accessToken: transaction.irechargeAccessToken
            })

            logger.info('Token request processed', logMeta);
            const updatedTransaction = await TransactionService.viewSingleTransaction(data.transactionId);
            if (!updatedTransaction) {
                throw new CustomError(
                    `CustomError fetching transaction with id ${data.transactionId}`,
                    {
                        transactionId: data.transactionId
                    }
                );
            }

            // Requery transaction from provider and update transaction status
            const vendResult = await TokenHandlerUtil.requeryTransactionFromVendor(updatedTransaction).catch(e => e);

            console.log({ vendResult })
            const vendResultFromBuypower = vendResult as unknown as ElectricityRequeryResponse['BUYPOWERNG'] & { source: 'BUYPOWERNG' }
            const vendResultFromBaxi = vendResult as {
                source: 'BAXI',
                data: BaxiRequeryResultForPurchase['Prepaid']['data'],
                responseCode: 200 | 202,
                status: boolean,
                message: 'Transaction successful'
            }
            const vendResultFromIrecharge = vendResult as unknown as ElectricityRequeryResponse['IRECHARGE'] & { source: 'IRECHARGE' }

            const eventMessage = {
                meter: {
                    meterNumber: meter.meterNumber,
                    disco: disco,
                    vendType: meter.vendType,
                    id: meter.id,
                },
                transactionId: transaction.id,
                error: {
                    code: (tokenInfo instanceof AxiosError
                        ? tokenInfo.response?.data?.responseCode
                        : undefined) as number | 0,
                    cause: TransactionErrorCause.UNKNOWN,
                },
            };
            const transactionEventService = new TransactionEventService(
                transaction,
                eventMessage.meter,
                data.superAgent,
                partner.email
            );
            await transactionEventService.addGetTransactionTokenFromVendorInitiatedEvent();
            await transactionEventService.addVendElectricityRequestedFromVendorEvent();

            // Check if error occured while purchasing token
            // Note that Irecharge api always returns 200, even when an error occurs
            if (tokenInfo instanceof Error) {
                logger.error('Error occured while purchasing token', logMeta)
                if (tokenInfo instanceof AxiosError) {
                    /**
                     * Note that these error codes are only valid for Buypower
                     * 202 - Timeout / Transaction is processing
                     * 501 - Maintenance error
                     * 500 - Unexpected error - Please requery
                     */
                    // If error is due to timeout, trigger event to requery transactioPn later
                    let responseCode = tokenInfo.response?.data.responseCode as keyof typeof TransactionErrorCodeAndCause;
                    responseCode = tokenInfo.message === 'Transaction timeout' ? 202 : responseCode

                    const requeryWasTriggeredTooEarly = (vendResult instanceof AxiosError) && vendResult.response?.status === 429

                    if (vendResultFromBuypower.source === 'BUYPOWERNG' && ([202, 500, 501].includes(responseCode) || requeryWasTriggeredTooEarly)) {
                        return await TokenHandlerUtil.triggerEventToRequeryTransactionTokenFromVendor(
                            {
                                eventService: transactionEventService,
                                eventData: { ...eventMessage, error: { code: responseCode, cause: TransactionErrorCodeAndCause[responseCode] ?? TransactionErrorCause.TRANSACTION_TIMEDOUT } },
                                retryCount: 1,
                                superAgent: data.superAgent,
                                tokenInResponse: null,
                                transactionTimedOutFromBuypower: false,
                                vendorRetryRecord: transaction.retryRecord[transaction.retryRecord.length - 1]
                            },
                        );
                    }

                    // This doesn't account for other errors that may arise from other Providers
                    // Other errors (4xx ...) occured while purchasing token 
                }

                // Transaction failed, trigger event to retry transaction from scratch
                /* Commmented out because no transaction should be allowed to fail, any failed transaction should be retried with a different vendor
                await transactionEventService.addTokenRequestFailedNotificationToPartnerEvent();
                return await VendorPublisher.publishEventForFailedTokenRequest(eventMessage); */
                return await TokenHandlerUtil.triggerEventToRetryTransactionWithNewVendor({ meter: data.meter, transaction: transaction as TransactionWithProductId, transactionEventService, vendorRetryRecord: data.vendorRetryRecord })
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
            const responseFromIrecharge = tokenInfo as Awaited<ReturnType<typeof VendorService.irechargeVendToken>>
            const transactionTimedOutFromIrecharge = vendResultFromIrecharge.source === 'IRECHARGE' ? ['15', '43'].includes(vendResultFromIrecharge.status) : false
            let transactionTimedOutFromBuypower = vendResultFromBuypower.source === 'BUYPOWERNG' ? vendResultFromBuypower.status === true && vendResultFromBuypower.data.responseCode == 202 : false // TODO: Add check for when transaction timeout from baxi
            const transactionTimedOutFromBaxi = vendResultFromBaxi.source === 'BAXI' ? vendResultFromBaxi.status === true && vendResultFromBaxi.data.statusCode === '0' : false
            const transactionTimedOut = transactionTimedOutFromBuypower || transactionTimedOutFromIrecharge || transactionTimedOutFromBaxi
            let tokenInResponse: string | null = null;

            const prepaid = meter.vendType === 'PREPAID';

            if (prepaid) {
                if (vendResult.source === 'BUYPOWERNG') {
                    tokenInResponse = vendResultFromBuypower.status === true && vendResultFromBuypower.data.responseCode !== 202 ? vendResultFromBuypower.data.token : null
                } else if (tokenInfo.source === 'BAXI') {
                    tokenInResponse = vendResultFromBaxi.data.rawData.standardTokenValue
                } else if (tokenInfo.source === 'IRECHARGE') {
                    tokenInResponse = vendResultFromIrecharge.token
                }
            } else {
                tokenInResponse = null // There is no token for postpaid meters
            }


            let requeryTransactionFromVendor = transactionTimedOut
            if (((tokenInResponse && prepaid) || (!tokenInResponse && !prepaid)) && TEST_FAILED) {
                const totalRetries = (retry.retryCountBeforeSwitchingVendor * transaction.previousVendors.length - 1) + retry.count + 1

                // If we are in test mode, and the transaction is successful, after a number of retries, we should assume the transaction is successful
                const shouldAssumeToBeSuccessful = (totalRetries > retry.limitToStopRetryingWhenTransactionIsSuccessful) && TEST_FAILED
                requeryTransactionFromVendor = !shouldAssumeToBeSuccessful
            }

            console.log({ tokenInResponse, requeryTransactionFromVendor })
            // If Transaction timedout - Requery the transaction at intervals
            if (requeryTransactionFromVendor || (!tokenInResponse && prepaid)) {
                return await TokenHandlerUtil.triggerEventToRequeryTransactionTokenFromVendor(
                    {
                        eventService: transactionEventService,
                        eventData: eventMessage,
                        transactionTimedOutFromBuypower,
                        tokenInResponse,
                        superAgent: transaction.superagent,
                        retryCount: 1,
                        vendorRetryRecord: transaction.retryRecord[transaction.retryRecord.length - 1]
                    },
                );
            }

            // Token purchase was successful
            // And token was found in request
            // Add and publish token received event
            await transactionEventService.addTokenReceivedEvent(tokenInResponse ?? 'null');
            return await VendorPublisher.publishEventForTokenReceivedFromVendor({
                transactionId: transaction!.id,
                user: {
                    name: user.name as string,
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
                    disco: transaction!.disco,
                    vendType: meter.vendType,
                    token: tokenInResponse ?? 'null',
                },
            });
        } catch (error) {
            if (error instanceof CustomError) {
                error.meta = error.meta ?? {
                    transactionId: data.transactionId
                }
            }

            throw error
        }
    }

    private static async handleTokenReceived(
        data: PublisherEventAndParameters[TOPICS.TOKEN_RECIEVED_FROM_VENDOR],
    ) {
        try {
            const logMeta = { meta: { transactionId: data.transactionId } }

            const transaction = await TransactionService.viewSingleTransaction(
                data.transactionId,
            );
            if (!transaction) {
                throw new CustomError(
                    `CustomError fetching transaction with id ${data.transactionId}`,
                    {
                        transactionId: data.transactionId
                    }
                );
            }

            // Check if transaction is already complete
            if (transaction.status === Status.COMPLETE) {
                throw new CustomError(
                    `Transaction with id ${data.transactionId} is already complete`,
                    {
                        transactionId: data.transactionId
                    }
                );
            }

            /**
             * This check was removed because BUYPOWERNG throws an error when you try to requery a transaction that has already been completed within 10s,
             * And the event that triggers this consumer is also used by other consumers which also requery the transaction.
             * 
             * Plus there is no need for extra check because only completed transactions are published to this topic
             */
            // // Requery transaction from provider and update transaction status
            // const requeryResult = await TokenHandlerUtil.requeryTransactionFromVendor(transaction);
            // const requeryResultFromBuypower = requeryResult as Awaited<ReturnType<typeof VendorService.buyPowerRequeryTransaction>>
            // const requeryResultFromBaxi = requeryResult as Awaited<ReturnType<typeof VendorService.baxiRequeryTransaction>>
            // const requeryResultFromIrecharge = requeryResult as Awaited<ReturnType<typeof VendorService.irechargeRequeryTransaction>>

            // const transactionSuccessFromBuypower = requeryResultFromBuypower.source === 'BUYPOWERNG' ? requeryResultFromBuypower.responseCode === 200 : false
            // const transactionSuccessFromBaxi = requeryResultFromBaxi.source === 'BAXI' ? requeryResultFromBaxi.responseCode === 200 : false
            // const transactionSuccessFromIrecharge = requeryResultFromIrecharge.source === 'IRECHARGE' ? requeryResultFromIrecharge.status === '00' && requeryResultFromIrecharge. : false

            // const transactionSuccess = transactionSuccessFromBuypower || transactionSuccessFromBaxi || transactionSuccessFromIrecharge
            // if (!transactionSuccess) {
            //     throw new CustomError(
            //         `CustomError requerying transaction with id ${data.transactionId}`,
            //     );
            // }

            // If successful, check if a power unit exists for the transaction, if none exists, create one
            let powerUnit =
                await PowerUnitService.viewSinglePowerUnitByTransactionId(
                    data.transactionId,
                );

            const prepaid = data.meter.vendType === 'PREPAID';
            data.meter.token = !prepaid ? '' : data.meter.token

            console.log({ disco: data.meter })
            const product = await ProductService.viewSingleProduct(transaction.productCodeId)
            if (!product) throw new CustomError('Product not found')


            const discoLogo =
                DISCO_LOGO[product.productName as keyof typeof DISCO_LOGO] ?? LOGO_URL

            console.log(discoLogo)
            logger.info('Saving token record', logMeta);
            powerUnit = powerUnit
                ? await PowerUnitService.updateSinglePowerUnit(powerUnit.id, {
                    token: data.meter.token,
                    transactionId: data.transactionId,
                })
                : await PowerUnitService.addPowerUnit({
                    id: uuidv4(),
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

            return await TransactionService.updateSingleTransaction(data.transactionId, {
                status: Status.COMPLETE,
                powerUnitId: powerUnit.id,
            });
        } catch (error) {
            if (error instanceof CustomError) {
                error.meta = error.meta ?? {
                    transactionId: data.transactionId
                }
            }

            throw error
        }
    }

    private static async requeryTransactionForToken(
        data: PublisherEventAndParameters[TOPICS.GET_TRANSACTION_TOKEN_FROM_VENDOR_RETRY],
    ) {
        try {

            console.warn(" Retrying transaction from vendor")
            retry.count = data.retryCount;

            // Check if token has been found
            const transaction = await TransactionService.viewSingleTransaction(data.transactionId);
            if (!transaction) {
                logger.error("Transaction not found");
                return;
            }

            const user = await transaction.$get('user')
            const meter = await transaction.$get('meter')
            const partner = await transaction.$get('partner')
            if (!user || !meter || !partner) {
                throw new CustomError("Transaction  required relations not found");
            }

            const transactionEventService = new TransactionEventService(
                transaction,
                data.meter,
                data.superAgent,
                partner.email
            );
            await transactionEventService.addGetTransactionTokenFromVendorInitiatedEvent();
            await VendorPublisher.publishEventForGetTransactionTokenFromVendorInitiated(
                {
                    transactionId: transaction.id,
                    meter: data.meter,
                    timeStamp: new Date(),
                    superAgent: data.superAgent
                },
            );

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
            const requeryResult = await TokenHandlerUtil.requeryTransactionFromVendor(transaction).catch(e => e);

            if (requeryResult instanceof Error) {
                if (requeryResult instanceof AxiosError) {
                    const requeryWasTriggeredTooEarly = requeryResult.response?.status === 429 && transaction.superagent === 'BUYPOWERNG'
                    if (requeryWasTriggeredTooEarly) {
                        return await TokenHandlerUtil.triggerEventToRequeryTransactionTokenFromVendor(
                            {
                                eventService: transactionEventService,
                                eventData: {
                                    meter: data.meter,
                                    transactionId: data.transactionId,
                                    error: { code: 202, cause: TransactionErrorCause.TRANSACTION_TIMEDOUT },
                                },
                                retryCount: data.retryCount + 1,
                                superAgent: data.superAgent,
                                tokenInResponse: null,
                                transactionTimedOutFromBuypower: false,
                                vendorRetryRecord: transaction.retryRecord[transaction.retryRecord.length - 1]
                            },
                        );
                    }
                }
                throw requeryResult
            }

            const requeryResultFromBuypower = requeryResult as Awaited<ReturnType<typeof VendorService.buyPowerRequeryTransaction>>
            const requeryResultFromBaxi = requeryResult as {
                source: 'BAXI',
                data: BaxiRequeryResultForPurchase['Prepaid']['data'],
                responseCode: 200 | 202,
                status: boolean,
                message: 'Transaction successful'
            }
            const requeryResultFromIrecharge = requeryResult as Awaited<ReturnType<typeof VendorService.irechargeRequeryTransaction>>

            const transactionSuccessFromBuypower = requeryResultFromBuypower.source === 'BUYPOWERNG' ? requeryResultFromBuypower.responseCode === 200 : false
            const transactionSuccessFromBaxi = requeryResultFromBaxi.source === 'BAXI' ? requeryResultFromBaxi.status : false
            const transactionSuccessFromIrecharge = requeryResultFromIrecharge.source === 'IRECHARGE' ? requeryResultFromIrecharge.status === '00' && requeryResultFromIrecharge.vend_status === 'successful' : false

            let transactionSuccess = (transactionSuccessFromBuypower || transactionSuccessFromBaxi || transactionSuccessFromIrecharge)
            console.log({ transactionSuccess })
            if (transactionSuccess && TEST_FAILED) {
                const totalRetries = (retry.retryCountBeforeSwitchingVendor * transaction.previousVendors.length - 1) + retry.count + 1

                // If we are in test mode, and the transaction is successful, after a number of retries, we should assume the transaction is successful
                transactionSuccess = (totalRetries > retry.limitToStopRetryingWhenTransactionIsSuccessful) && TEST_FAILED
            }

            if (!transactionSuccess) {
                console.log({ requeryResult })
                /**
                 * Transaction may be unsuccessful but it doesn't mean it has failed
                 * The transaction can still be pending
                 * If transaction failed, switch to a new vendor
                 */
                let requeryFromNewVendor = false
                let requeryFromSameVendor = false
                let error: {
                    code: number,
                    cause: TransactionErrorCause
                } = { code: 202, cause: TransactionErrorCause.UNKNOWN }
                if (requeryResult.source === 'BUYPOWERNG') {
                    console.log({ requeryResultFromBuypower, retry, test: TEST_FAILED })
                    let transactionFailed = requeryResultFromBuypower.responseCode === 202
                    transactionFailed = TEST_FAILED ? retry.count > retry.retryCountBeforeSwitchingVendor : transactionFailed // TOGGLE - Will simulate failed buypower transaction
                    if (transactionFailed) requeryFromNewVendor = true
                    else {
                        requeryFromSameVendor = true
                        error.code = requeryResultFromBuypower.responseCode
                        error.cause = requeryResultFromBuypower.responseCode === 201 ? TransactionErrorCause.TRANSACTION_TIMEDOUT : TransactionErrorCause.TRANSACTION_FAILED
                    }

                } else if (requeryResult.source === 'BAXI') {
                    let transactionFailed = !requeryResultFromBaxi.status
                    transactionFailed = TEST_FAILED ? retry.count > retry.retryCountBeforeSwitchingVendor : transactionFailed // TOGGLE - Will simulate failed baxi transaction
                    if (transactionFailed) requeryFromNewVendor = true
                    else {
                        requeryFromSameVendor = true
                        error.code = requeryResultFromBaxi.responseCode === 200 ? 200 : 202
                        error.cause = requeryResultFromBaxi.responseCode === 200 ? TransactionErrorCause.TRANSACTION_TIMEDOUT : TransactionErrorCause.TRANSACTION_FAILED
                    }
                } else if (requeryResult.source === 'IRECHARGE') {
                    let transactionFailed = !['00', '15', '43'].includes(requeryResultFromIrecharge.status)
                    transactionFailed = TEST_FAILED ? retry.count > retry.retryCountBeforeSwitchingVendor : transactionFailed // TOGGLE - Will simulate failed irecharge transaction
                    if (transactionFailed) requeryFromNewVendor = true
                    else {
                        requeryFromSameVendor = true
                        error.code = requeryResultFromIrecharge.status === '00' ? 200 : 202
                        error.cause = requeryResultFromIrecharge.status === '00' ? TransactionErrorCause.TRANSACTION_TIMEDOUT : TransactionErrorCause.TRANSACTION_FAILED
                    }
                }

                if (requeryFromNewVendor) {
                    return await TokenHandlerUtil.triggerEventToRetryTransactionWithNewVendor({ meter, transaction, transactionEventService, vendorRetryRecord: data.vendorRetryRecord })
                }

                if (requeryFromSameVendor) {
                    return await TokenHandlerUtil.triggerEventToRequeryTransactionTokenFromVendor(
                        {
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
                            vendorRetryRecord: transaction.retryRecord[transaction.retryRecord.length - 1]
                        },
                    );
                }
            }

            let token: string | undefined = undefined
            if (requeryResult.source === 'BUYPOWERNG') token = (requeryResultFromBuypower as SuccessResponseForBuyPowerRequery).data?.token
            else if (requeryResult.source === 'BAXI') token = requeryResultFromBaxi.data.rawData.standardTokenValue
            else if (requeryResult.source === 'IRECHARGE') token = requeryResultFromIrecharge.token


            const vendor = await VendorModelService.viewSingleVendorByName(data.superAgent)
            if (!vendor) throw new CustomError('Vendor not found')

            console.log({ disco: transaction.disco })
            const product = await ProductService.viewSingleProductByMasterProductCode(transaction.disco)
            if (!product) throw new CustomError('Product not found')

            const vendorProduct = await VendorProductService.viewSingleVendorProductByVendorIdAndProductId(vendor.id, product.id)
            if (!vendorProduct) throw new CustomError('Vendor product not found')

            const disco = vendorProduct.schemaData.code

            const prepaid = data.meter.vendType === 'PREPAID';
            if (!token && prepaid) {
                return await TokenHandlerUtil.triggerEventToRequeryTransactionTokenFromVendor(
                    {
                        eventService: transactionEventService,
                        eventData: {
                            meter: {
                                meterNumber: meter.meterNumber,
                                disco: disco,
                                vendType: meter.vendType,
                                id: meter.id,
                            },
                            transactionId: transaction.id,
                            error: {
                                code: 202,
                                cause: TransactionErrorCause.NO_TOKEN_IN_RESPONSE,
                            },
                        },
                        retryCount: data.retryCount + 1,
                        superAgent: data.superAgent,
                        tokenInResponse: null,
                        vendorRetryRecord: transaction.retryRecord[transaction.retryRecord.length - 1],
                        transactionTimedOutFromBuypower: false,
                    },
                );
            }

            await transactionEventService.addTokenReceivedEvent(prepaid ? token! : 'null')
            await VendorPublisher.publishEventForTokenReceivedFromVendor({
                meter: {
                    ...data.meter,
                    token: prepaid ? token! : 'null'
                },
                transactionId: transaction.id,
                user: {
                    name: transaction.user.name as string,
                    email: transaction.user.email,
                    address: transaction.user.address,
                    phoneNumber: transaction.user.phoneNumber,
                },
                partner: {
                    email: transaction.partner.email,
                },
            });
        } catch (error) {
            if (error instanceof CustomError) {
                error.meta = error.meta ?? {
                    transactionId: data.transactionId
                }
            }

            throw error
        }
    }

    static registry = {
        [TOPICS.POWER_PURCHASE_INITIATED_BY_CUSTOMER]: this.handleTokenRequest,
        [TOPICS.TOKEN_RECIEVED_FROM_VENDOR]: this.handleTokenReceived,
        [TOPICS.GET_TRANSACTION_TOKEN_FROM_VENDOR_RETRY]:
            this.requeryTransactionForToken,
        [TOPICS.POWER_PURCHASE_INITIATED_BY_CUSTOMER_REQUERY]:
            this.requeryTransactionForToken,
        [TOPICS.RETRY_PURCHASE_FROM_NEW_VENDOR]: this.retryPowerPurchaseWithNewVendor
    };
}


export default class TokenConsumer extends ConsumerFactory {
    constructor() {
        const messageProcessor = new MessageProcessor(
            TokenHandler.registry,
            "TOKEN_CONSUMER",
        );
        super(messageProcessor);
    }
}

