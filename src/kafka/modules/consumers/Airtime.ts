import { AxiosError } from "axios";
import { Status } from "../../../models/Transaction.model";
import Meter from "../../../models/Meter.model";
import Transaction from "../../../models/Transaction.model";
import PowerUnitService from "../../../services/PowerUnit.service";
import TransactionService from "../../../services/Transaction.service";
import TransactionEventService, { AirtimeTransactionEventService } from "../../../services/TransactionEvent.service";
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
} from "../util/Interface";
import MessageProcessor from "../util/MessageProcessor";
import { v4 as uuidv4 } from "uuid";
import EventService from "../../../services/Event.service";
import VendorService, { Prettify, SuccessResponseForBuyPowerRequery, VendorAirtimeService } from "../../../services/Vendor.service";
import { generateRandomToken } from "../../../utils/Helper";
import BuypowerApi from "../../../services/Vendor.service/Buypower";
import { IRechargeApi } from "../../../services/Vendor.service/Irecharge";

interface EventMessage {
    phone: {
        phoneNumber: string;
        amount: number;
    };
    transactionId: string;
}

interface TriggerRequeryTransactionTokenProps {
    eventService: AirtimeTransactionEventService;
    eventData: EventMessage & {
        error: {
            cause: TransactionErrorCause;
            code: number;
        }
    },
    transactionTimedOutFromBuypower: boolean;
    superAgent: Transaction['superagent'];
    retryCount: number;
}

interface TokenPurchaseData<T = 'IRECHARGE'> {
    transaction: Omit<Transaction, 'superagent'> & { superagent: T },
    phoneNumber: string,
    email: string,
    amount: number,
    accountNumber: string,
    serviceProvider: 'MTN' | 'GLO' | 'AIRTEL' | '9MOBILE',
}

interface ProcessVendRequestReturnData {
    'BUYPOWERNG': Awaited<ReturnType<typeof BuypowerApi.Airtime.purchase>>,
    'IRECHARGE': Awaited<ReturnType<typeof IRechargeApi.Airtime.purchase>>,
}

const retry = {
    count: 0,
    // limit: 5,
    retryCountBeforeSwitchingVendor: 2,
}

const TEST_FAILED = NODE_ENV === 'production' ? false : false // TOGGLE - Will simulate failed transaction

const TransactionErrorCodeAndCause = {
    501: TransactionErrorCause.MAINTENANCE_ACCOUNT_ACTIVATION_REQUIRED,
    500: TransactionErrorCause.UNEXPECTED_ERROR,
    202: TransactionErrorCause.TRANSACTION_TIMEDOUT
}

export function getCurrentWaitTimeForRequeryEvent(retryCount: number) {
    // Use geometric progression  calculate wait time, where R = 2
    const waitTime = 2 ** (retryCount - 1)
    return waitTime
}

export class TokenHandlerUtil {
    static async triggerEventToRequeryTransactionTokenFromVendor({
        eventService,
        eventData,
        transactionTimedOutFromBuypower,
        retryCount,
        superAgent
    }: TriggerRequeryTransactionTokenProps) {
        // Check if the transaction has hit the requery limit
        // If yes, flag transaction
        if (retryCount >= MAX_REQUERY_PER_VENDOR) {
            logger.info(`Flagged transaction with id ${eventData.transactionId} after hitting requery limit`)
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
         * 500 - Unexpected Error
         */
        transactionTimedOutFromBuypower && (await eventService.addRequestTimedOutEvent());

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
        );

        await eventService.addGetAirtimeFromVendorRetryEvent(_eventMessage.error, retryCount);
        const eventMetaData = {
            transactionId: eventData.transactionId,
            phone: eventData.phone,
            error: eventData.error,
            timeStamp: new Date(),
            retryCount,
            superAgent,
            waitTime: getCurrentWaitTimeForRequeryEvent(retryCount)
        };

        // Start timer to requery transaction at intervals
        async function countDownTimer(time: number) {
            for (let i = time; i > 0; i--) {
                setTimeout(() => {
                    logger.info(`Retrying transaction ${i} seconds`)
                }, (time - i) * 1000)
            }
        }
        countDownTimer(eventMetaData.waitTime);

        // Publish event in increasing intervals of seconds i.e 1, 2, 4, 8, 16, 32, 64, 128, 256, 512
        // TODO: Use an external service to schedule this task
        setTimeout(async () => {
            logger.info('Retrying transaction from vendor')
            await VendorPublisher.publishEventForGetAirtimeFromVendorRetry(
                eventMetaData,
            );
        }, eventMetaData.waitTime * 1000);
    }

    static async triggerEventToRetryTransactionWithNewVendor(
        {
            transaction, transactionEventService, phone,
        }: {
            transaction: Transaction,
            transactionEventService: AirtimeTransactionEventService,
            phone: { phoneNumber: string, amount: number },
        }
    ) {
        // Attempt purchase from new vendor
        if (!transaction.bankRefId) throw new Error('BankRefId not found')

        const newVendor = await TokenHandlerUtil.getNextBestVendorForVendRePurchase(transaction.superagent)
        await transactionEventService.addAirtimePurchaseWithNewVendorEvent({ currentVendor: transaction.superagent, newVendor })

        const user = await transaction.$get('user')
        if (!user) throw new Error('User not found for transaction')

        const partner = await transaction.$get('partner')
        if (!partner) throw new Error('Partner not found for transaction')

        retry.count = 0
        return await VendorPublisher.publishEventForAirtimePurchaseRetryFromVendorWithNewVendor({
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
            phone: phone,
        })
    }

    static async processVendRequest<T extends 'IRECHARGE'>({ transaction, ...data }: TokenPurchaseData<T>): Promise<ProcessVendRequestReturnData[T]> {
        const _data = {
            accountNumber: data.accountNumber,
            phoneNumber: data.phoneNumber,
            serviceType: data.serviceProvider,
            amount: data.amount,
            email: data.email,
            reference: transaction.reference,
        }

        switch (transaction.superagent) {
            // case "BAXI":
            //     return await VendorService.baxiVendToken(_data)
            // case "BUYPOWERNG":
            //     return await VendorService.purchaseAirtime({
            //         data: {
            //             accountNumber: data.accountNumber,
            //             phoneNumber: data.phoneNumber,
            //             serviceType: data.serviceProvider,
            //             amount: data.amount,
            //             email: data.email,
            //             reference: transaction.reference,
            //         }, vendor: 'BUYPOWERNG'
            //     }).then(response => ({ ...response, source: 'BUYPOWERNG' }))
            case "IRECHARGE":
                return await VendorService.purchaseAirtime({ data: _data, vendor: 'IRECHARGE' })
                    .then(response => ({ ...response, source: 'IRECHARGE' }))
            default:
                throw new Error("Invalid superagent");
        }
    }

    static async requeryTransactionFromVendor(transaction: Transaction) {
        switch (transaction.superagent) {
            case 'BAXI':
                return await VendorService.baxiRequeryTransaction({ reference: transaction.reference })
            case 'BUYPOWERNG':
                return await VendorService.buyPowerRequeryTransaction({ reference: transaction.reference })
            case 'IRECHARGE':
                return await VendorService.irechargeRequeryTransaction({ accessToken: transaction.irecharge_token, serviceType: 'airtime' })
            default:
                throw new Error('Unsupported superagent')
        }
    }

    static async getNextBestVendorForVendRePurchase(currentVendor: Transaction['superagent']) {
        // TODO: Implement logic to calculate best rates from different vendors
        const nextVendor = {
            BUYPOWERNG: 'BAXI',
            BAXI: 'IRECHARGE',
            IRECHARGE: 'BUYPOWERNG'
        } as const

        return nextVendor.IRECHARGE
    }
}

class TokenHandler extends Registry {
    private static async retryPowerPurchaseWithNewVendor(data: PublisherEventAndParameters[TOPICS.RETRY_AIRTIME_PURCHASE_FROM_NEW_VENDOR]) {
        const transaction = await TransactionService.viewSingleTransaction(data.transactionId);
        if (!transaction) {
            throw new Error(`Error fetching transaction with id ${data.transactionId}`);
        }
        if (!transaction.bankRefId) {
            throw new Error('BankRefId not found')
        }

        await TransactionService.updateSingleTransaction(transaction.id, { superagent: data.newVendor })
        const transactionEventService = new AirtimeTransactionEventService(transaction, data.newVendor, data.partner.email, data.phone.phoneNumber);
        await transactionEventService.addAirtimePurchaseInitiatedEvent({ amount: transaction.amount });
        await VendorPublisher.publshEventForAirtimePurchaseInitiate({
            phone: data.phone,
            user: data.user,
            partner: data.partner,
            transactionId: transaction.id,
            superAgent: data.newVendor,
        })
    }

    private static async handleAirtimeRequest(
        data: PublisherEventAndParameters[TOPICS.AIRTIME_PURCHASE_INITIATED_BY_CUSTOMER],
    ) {
        console.log({
            log: 'New token request',
            currentVendor: data.superAgent
        })

        const transaction = await TransactionService.viewSingleTransaction(
            data.transactionId,
        );
        if (!transaction) {
            logger.error(
                `Error fetching transaction with id ${data.transactionId}`,
            );
            return;
        }

        const { user, partner } = transaction;

        if (transaction.superagent === 'BAXI') {
            throw 'Unsupported superagent'
        }

        // Purchase token from vendor
        const tokenInfo = await TokenHandlerUtil.processVendRequest({
            transaction: transaction as TokenPurchaseData['transaction'],
            phoneNumber: data.phone.phoneNumber,
            email: user.email,
            amount: parseFloat(transaction.amount),
            accountNumber: data.phone.phoneNumber,
            serviceProvider: transaction.disco as TokenPurchaseData['serviceProvider'],
        });

        const error = { code: 202, cause: TransactionErrorCause.UNKNOWN }
        const transactionEventService = new AirtimeTransactionEventService(
            transaction,
            data.superAgent,
            partner.email,
            data.phone.phoneNumber,
        );
        await transactionEventService.addVendAirtimeRequestedFromVendorEvent();

        let requeryFromNewVendor = false
        let requeryFromSameVendor = false
        let transactionFailed = !['00', '15', '43'].includes(tokenInfo.status)
        const transactionSuccessFul = tokenInfo.status === '00'
        transactionFailed = TEST_FAILED ? retry.count > retry.retryCountBeforeSwitchingVendor : transactionFailed // TOGGLE - Will simulate failed irecharge transaction
        if (transactionFailed) requeryFromNewVendor = true
        else {
            requeryFromSameVendor = true
            error.code = tokenInfo.status === '00' ? 200 : 202
            error.cause = tokenInfo.status === '00' ? TransactionErrorCause.TRANSACTION_TIMEDOUT : TransactionErrorCause.TRANSACTION_FAILED
        }

        const eventMessage = {
            phone: data.phone,
            transactionId: transaction.id,
            error: error,
        };

        if (!transactionSuccessFul) {
            if (requeryFromNewVendor) {
                return await TokenHandlerUtil.triggerEventToRetryTransactionWithNewVendor({ phone: data.phone, transaction, transactionEventService })
            }

            return await TokenHandlerUtil.triggerEventToRequeryTransactionTokenFromVendor(
                {
                    eventService: transactionEventService,
                    eventData: eventMessage,
                    retryCount: 1,
                    superAgent: data.superAgent,
                    transactionTimedOutFromBuypower: true,
                },
            );
        }

        await transaction.update({ irecharge_token: tokenInfo.ref })
        await transactionEventService.addAirtimeReceivedFromVendorEvent();
        return await VendorPublisher.publishEventForAirtimeReceivedFromVendor({
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
            phone: data.phone
        });
    }

    private static async handleAirtimeRecievd(
        data: PublisherEventAndParameters[TOPICS.AIRTIME_RECEIVED_FROM_VENDOR],
    ) {
        const transaction = await TransactionService.viewSingleTransaction(
            data.transactionId,
        );
        if (!transaction) {
            throw new Error(
                `Error fetching transaction with id ${data.transactionId}`,
            );
        }

        // Check if transaction is already complete
        if (transaction.status === Status.COMPLETE) {
            throw new Error(
                `Transaction with id ${data.transactionId} is already complete`,
            );
        }

        // Requery transaction from provider and update transaction status
        const requeryResult = await TokenHandlerUtil.requeryTransactionFromVendor(transaction);
        const requeryResultFromBuypower = requeryResult as Awaited<ReturnType<typeof VendorService.buyPowerRequeryTransaction>>
        const requeryResultFromIrecharge = requeryResult as Awaited<ReturnType<typeof VendorService.irechargeRequeryTransaction>>
        // const requeryResultFromBaxi = requeryResult as Awaited<ReturnType<typeof VendorService.baxiRequeryTransaction>>

        const transactionSuccessFromBuypower = requeryResultFromBuypower.source === 'BUYPOWERNG' ? requeryResultFromBuypower.responseCode === 200 : false
        const transactionSuccessFromIrecharge = requeryResultFromIrecharge.source === 'IRECHARGE' ? requeryResultFromIrecharge.status === '00' : false
        // const transactionSuccessFromBaxi = requeryResultFromBaxi.source === 'BAXI' ? requeryResultFromBaxi.responseCode === 200 : false

        const transactionEventService = new AirtimeTransactionEventService(
            transaction,
            transaction.superagent,
            transaction.partner.email,
            data.phone.phoneNumber,
        );
        const transactionSuccess = transactionSuccessFromBuypower || transactionSuccessFromIrecharge

        if (!transactionSuccess) {
            await transactionEventService.addAirtimeTransactionRequery()
            await TokenHandlerUtil.triggerEventToRequeryTransactionTokenFromVendor({
                eventService: transactionEventService,
                eventData: {
                    phone: data.phone,
                    transactionId: data.transactionId,
                    error: {
                        code: requeryResultFromBuypower.responseCode,
                        cause: TransactionErrorCause.TRANSACTION_FAILED
                    }
                },
                retryCount: 1,
                superAgent: transaction.superagent,
                transactionTimedOutFromBuypower: false,
            })
        }

        return await TransactionService.updateSingleTransaction(data.transactionId, {
            status: Status.COMPLETE,
        });
    }

    private static async requeryTransaction(
        data: PublisherEventAndParameters[TOPICS.GET_AIRTIME_FROM_VENDOR_RETRY],
    ) {
        retry.count = data.retryCount;
        console.log({
            retryCount: data.retryCount
        })

        // Check if token has been found
        const transaction = await TransactionService.viewSingleTransaction(data.transactionId);
        if (!transaction) {
            logger.error("Transaction not found");
            return;
        }

        const user = await transaction.$get('user')
        const partner = await transaction.$get('partner')
        if (!user || !partner) {
            throw new Error("Transaction  required relations not found");
        }

        const transactionEventService = new AirtimeTransactionEventService(
            transaction,
            data.superAgent,
            partner.email,
            data.phone.phoneNumber
        );
        await transactionEventService.addAirtimeTranasctionRequeryInitiated();

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
        const requeryResult = await TokenHandlerUtil.requeryTransactionFromVendor(transaction)
        const requeryResultFromBuypower = requeryResult as Awaited<ReturnType<typeof VendorService.buyPowerRequeryTransaction>>
        // const requeryResultFromBaxi = requeryResult as Awaited<ReturnType<typeof VendorService.baxiRequeryTransaction>>
        const requeryResultFromIrecharge = requeryResult as Awaited<ReturnType<typeof VendorService.irechargeRequeryTransaction>>

        const transactionSuccessFromBuypower = requeryResultFromBuypower.source === 'BUYPOWERNG' ? requeryResultFromBuypower.responseCode === 200 : false
        // const transactionSuccessFromBaxi = requeryResultFromBaxi.source === 'BAXI' ? requeryResultFromBaxi.responseCode === 200 : false
        const transactionSuccessFromIrecharge = requeryResultFromIrecharge.source === 'IRECHARGE' ? requeryResultFromIrecharge.status === '00' : false

        const transactionSuccess = TEST_FAILED ? false : transactionSuccessFromBuypower
        // console.log({ transactionSuccess, transactionSuccessFromBuypower, transactionSuccessFromBaxi, transactionSuccessFromIrecharge })
        // console.log({
        //     requeryResultFromIrecharge
        // })
        if (!transactionSuccess) {
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
                let transactionFailed = requeryResultFromBuypower.responseCode === 202
                transactionFailed = TEST_FAILED ? retry.count > retry.retryCountBeforeSwitchingVendor : transactionFailed // TOGGLE - Will simulate failed buypower transaction
                if (transactionFailed) requeryFromNewVendor = true
                else {
                    requeryFromSameVendor = true
                    error.code = requeryResultFromBuypower.responseCode
                    error.cause = requeryResultFromBuypower.responseCode === 201 ? TransactionErrorCause.TRANSACTION_TIMEDOUT : TransactionErrorCause.TRANSACTION_FAILED
                }
            } else if (requeryResult.source === 'BAXI') {
                // TODO: Add logic to handle baxi requery
            } else if (requeryResult.source === 'IRECHARGE') {
                let transactionFailed = !['00', '15', '43'].includes(requeryResultFromIrecharge.status)
                transactionFailed = TEST_FAILED ? retry.count > retry.retryCountBeforeSwitchingVendor : transactionFailed // TOGGLE - Will simulate failed irecharge transaction
                if (transactionFailed) requeryFromNewVendor = true
                else {
                    if (requeryResultFromIrecharge.status !== '00') {
                        requeryFromSameVendor = true
                        error.code = 202
                        error.cause = TransactionErrorCause.TRANSACTION_FAILED
                    }
                }
            }

            logger.error(
                `Error requerying transaction with id ${data.transactionId} 1213 `,
            );

            if (requeryFromNewVendor) {
                return await TokenHandlerUtil.triggerEventToRetryTransactionWithNewVendor({ phone: data.phone, transaction, transactionEventService })
            }

            if (requeryFromSameVendor) {
                return await TokenHandlerUtil.triggerEventToRequeryTransactionTokenFromVendor(
                    {
                        eventService: transactionEventService,
                        eventData: {
                            phone: data.phone,
                            transactionId: data.transactionId,
                            error: error
                        },
                        retryCount: data.retryCount + 1,
                        superAgent: data.superAgent,
                        transactionTimedOutFromBuypower: false,
                    },
                );
            }
        }

        await transactionEventService.addAirtimeTransactionRequery()
        await VendorPublisher.publishEventForAirtimeReceivedFromVendor({
            phone: data.phone,
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
    }

    static registry = {
        [TOPICS.AIRTIME_PURCHASE_INITIATED_BY_CUSTOMER]: this.handleAirtimeRequest,
        [TOPICS.AIRTIME_RECEIVED_FROM_VENDOR]: this.handleAirtimeRecievd,
        [TOPICS.GET_AIRTIME_FROM_VENDOR_RETRY]: this.requeryTransaction,
        [TOPICS.AIRTIME_PURCHASE_RETRY_FROM_NEW_VENDOR]: this.retryPowerPurchaseWithNewVendor,
    };
}

export default class AirtimeConsumer extends ConsumerFactory {
    constructor() {
        const messageProcessor = new MessageProcessor(
            TokenHandler.registry,
            "TOKEN_CONSUMER",
        );
        super(messageProcessor);
    }
}

