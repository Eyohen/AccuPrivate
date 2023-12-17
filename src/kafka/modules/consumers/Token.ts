import { AxiosError } from "axios";
import { Status } from "../../../models/Event.model";
import Meter from "../../../models/Meter.model";
import Transaction from "../../../models/Transaction.model";
import PowerUnitService from "../../../services/PowerUnit.service";
import TransactionService from "../../../services/Transaction.service";
import TransactionEventService from "../../../services/TransactionEvent.service";
import VendorService, { PurchaseResponse } from "../../../services/Vendor.service";
import { DISCO_LOGO } from "../../../utils/Constants";
import logger from "../../../utils/Logger";
import { TOPICS } from "../../Constants";
import { VendorPublisher } from "../publishers/Vendor";
import ConsumerFactory from "../util/Consumer";
import { PublisherEventAndParameters, Registry, TransactionErrorCause } from "../util/Interface";
import MessageProcessor from "../util/MessageProcessor";
import { v4 as uuidv4 } from 'uuid';

interface EventMessage {
    meter: { meterNumber: string, disco: Transaction['disco'], vendType: Meter['vendType'], id: string },
    transactionId: string
}

interface TriggerRequeryTransactionTokenProps { eventService: TransactionEventService, eventMessage: EventMessage & { error: { code: number, cause: TransactionErrorCause } }, retryCount: number }

class TokenHandler extends Registry {
    private static async triggerEventToRequeryTransactionTokenFromVendor({ eventService, eventMessage, retryCount }: TriggerRequeryTransactionTokenProps) {
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
        await eventService.addGetTransactionTokenRequestedFromVendorEvent()
        const eventMetaData = {
            transactionId: eventMessage.transactionId,
            meter: eventMessage.meter,
            error: eventMessage.error,
            timeStamp: new Date(),
            retryCount,
        }
        await VendorPublisher.publishEventForGetTransactionTokenRequestedFromVendorRetry(eventMetaData)
    }

    private static async handleTokenRequest(data: PublisherEventAndParameters[TOPICS.POWER_PURCHASE_INITIATED_BY_CUSTOMER]) {
        const transaction = await TransactionService.viewSingleTransaction(data.transactionId)
        if (!transaction) {
            logger.error(`Error fetching transaction with id ${data.transactionId}`)
            return
        }
        const { user, meter, partner } = transaction

        // Purchase token from vendor
        const tokenInfo = await VendorService.buyPowerVendToken({
            transactionId: transaction.reference,
            meterNumber: data.meter.meterNumber,
            disco: data.meter.disco,
            vendType: data.meter.vendType,
            amount: transaction.amount,
            phone: user.phoneNumber
        }).catch(e => e) as Error | Awaited<ReturnType<typeof VendorService.buyPowerVendToken>>

        const eventMessage = {
            meter: {
                meterNumber: meter.meterNumber,
                disco: transaction.disco,
                vendType: meter.vendType,
                id: meter.id
            },
            transactionId: transaction.id,
            error: {
                code: (tokenInfo instanceof AxiosError ? tokenInfo.response?.data?.responseCode : undefined) as number | undefined
            }
        }
        const transactionEventService = new TransactionEventService(transaction, eventMessage.meter)
        await transactionEventService.addVendElectricityRequestedFromVendorEvent()

        // Check if error occured while purchasing token
        if (tokenInfo instanceof Error) {
            if (tokenInfo instanceof AxiosError) {
                /**
                 * 202 - Timeout / Transaction is processing
                 * 501 - Maintenance error
                 * 500 - Unexpected error - Please requery
                */
                // If error is due to timeout, trigger event to requery transaction later
                const responseCode = tokenInfo.response?.data.responseCode
                const requeryTxn = [202, 500, 501].includes(responseCode) || tokenInfo.message === 'Transaction timeout'
                if (requeryTxn) {
                    let cause = TransactionErrorCause.TRANSACTION_TIMEDOUT
                    if (responseCode === 501) {
                        cause = TransactionErrorCause.MAINTENANCE_ACCOUNT_ACTIVATION_REQUIRED
                    } else if (responseCode === 500) {
                        cause = TransactionErrorCause.UNEXPECTED_ERROR
                    }

                    const _eventMessage = { ...eventMessage, error: { code: responseCode, cause } }
                    return await this.triggerEventToRequeryTransactionTokenFromVendor({ eventService: transactionEventService, eventMessage: _eventMessage, retryCount: 1 })
                }

                // Other errors (4xx ...) occured while purchasing token
                await transactionEventService.addTokenRequestFailedNotificationToPartnerEvent()
                return await VendorPublisher.publishEventForFailedTokenRequest(eventMessage)
            }

            logger.error('Error purchasing token', tokenInfo)
            // Transaction failed, trigger event to retry transaction from scratch
            // TODO: Add timer to trigger it at increasing intervals
            await transactionEventService.addTokenRequestFailedNotificationToPartnerEvent()
            return await VendorPublisher.publishEventForFailedTokenRequest(eventMessage)
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
        const transactionTimedOut = tokenInfo.data.responseCode == 202
        const tokenInResponse = (tokenInfo as PurchaseResponse).data.token

        // Transaction timedout - Requery the transactio at intervals
        if (transactionTimedOut || !tokenInResponse) {
            transactionTimedOut && await transactionEventService.addTokenRequestTimedOutEvent()
            !tokenInResponse && await transactionEventService.addTokenRequestFailedNotificationToPartnerEvent()

            const _eventMessage = { ...eventMessage, error: { code: 202, cause: transactionTimedOut ? TransactionErrorCause.TRANSACTION_TIMEDOUT : TransactionErrorCause.NO_TOKEN_IN_RESPONSE } }
            return await this.triggerEventToRequeryTransactionTokenFromVendor({ eventService: transactionEventService, eventMessage: _eventMessage, retryCount: 1 })
        }

        // Token purchase was successful
        // And token was found in request
        // Add and publish token received event
        const _tokenInfo = tokenInfo as PurchaseResponse
        await transactionEventService.addTokenReceivedEvent(_tokenInfo.data.token);
        return await VendorPublisher.publishEventForTokenReceivedFromVendor({
            transactionId: transaction.id,
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
                disco: transaction.disco,
                vendType: meter.vendType,
                token: _tokenInfo.data.token,
            },
        })
    }

    private static async handleTokenReceived(data: PublisherEventAndParameters[TOPICS.TOKEN_RECIEVED_FROM_VENDOR]) {
        const transaction = await TransactionService.viewSingleTransaction(data.transactionId)
        if (!transaction) {
            logger.error(`Error fetching transaction with id ${data.transactionId}`)
            return
        }

        // Check if transaction is already complete
        if (transaction.status === Status.COMPLETE) {
            logger.error(`Transaction with id ${data.transactionId} is already complete`)
            return
        }

        // Requery transaction from provider and update transaction status
        const requeryResult = await VendorService.buyPowerRequeryTransaction({ transactionId: transaction.reference })
        const transactionSuccess = requeryResult.responseCode === 200
        if (!transactionSuccess) {
            logger.error(`Error requerying transaction with id ${data.transactionId}`)
            return
        }

        // If successful, check if a power unit exists for the transaction, if none exists, create one
        let powerUnit = await PowerUnitService.viewSinglePowerUnitByTransactionId(data.transactionId)

        const discoLogo = DISCO_LOGO[data.meter.disco as keyof typeof DISCO_LOGO]
        powerUnit = powerUnit
            ? await PowerUnitService.updateSinglePowerUnit(powerUnit.id, {
                token: requeryResult.data.token,
                transactionId: data.transactionId,
            })
            : await PowerUnitService.addPowerUnit({
                id: uuidv4(),
                transactionId: data.transactionId,
                disco: data.meter.disco,
                discoLogo,
                amount: transaction.amount,
                meterId: data.meter.id,
                superagent: 'BUYPOWERNG',
                token: requeryResult.data.token,
                tokenNumber: 0,
                tokenUnits: '0',
                address: transaction.meter.address,
            })

        await TransactionService.updateSingleTransaction(data.transactionId, { status: Status.COMPLETE, powerUnitId: powerUnit.id })
        return
    }

    private static async requeryTransactionForToken(data: PublisherEventAndParameters[TOPICS.GET_TRANSACTION_TOKEN_REQUESTED_FROM_VENDOR_RETRY]) {
        // Check if token has been found
        const transaction = await TransactionService.viewSingleTransaction(data.transactionId)
        if (!transaction) {
            logger.error('Transaction not found')
            return
        }

        const transactionEventService = new TransactionEventService(transaction, data.meter)
        await transactionEventService.addGetTransactionTokenFromVendorInitiatedEvent()
        await VendorPublisher.publishEventForGetTransactionTokenFromVendorInitiated({
            transactionId: transaction.id,
            meter: data.meter,
            timeStamp: new Date()
        })

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
        const requeryResult = await VendorService.buyPowerRequeryTransaction({ transactionId: transaction.reference })
        const transactionSuccess = requeryResult.responseCode === 200
        if (!transactionSuccess) {
            logger.error(`Error requerying transaction with id ${data.transactionId}`)
            // TODO: Trigger requery transaction at interval
            let cause = TransactionErrorCause.UNKNOWN
            if (requeryResult.responseCode === 201) {
                cause = TransactionErrorCause.TRANSACTION_TIMEDOUT
            } else {
                cause = TransactionErrorCause.TRANSACTION_FAILED
            }

            const eventMessage = { meter: data.meter, transactionId: data.transactionId, error: { code: requeryResult.responseCode, cause } }
            await this.triggerEventToRequeryTransactionTokenFromVendor({ eventService: transactionEventService, eventMessage, retryCount: data.retryCount + 1 })
            return
        }

        // If successful, check if a power unit exists for the transaction, if none exists, create one
        let powerUnit = await PowerUnitService.viewSinglePowerUnitByTransactionId(data.transactionId)

        const discoLogo = DISCO_LOGO[data.meter.disco as keyof typeof DISCO_LOGO]
        powerUnit = powerUnit
            ? await PowerUnitService.updateSinglePowerUnit(powerUnit.id, {
                token: requeryResult.data.token,
                transactionId: data.transactionId,
            })
            : await PowerUnitService.addPowerUnit({
                id: uuidv4(),
                transactionId: data.transactionId,
                disco: data.meter.disco,
                discoLogo,
                amount: transaction.amount,
                meterId: data.meter.id,
                superagent: 'BUYPOWERNG',
                token: requeryResult.data.token,
                tokenNumber: 0,
                tokenUnits: '0',
                address: transaction.meter.address,
            })

        await TransactionService.updateSingleTransaction(data.transactionId, { status: Status.COMPLETE, powerUnitId: powerUnit.id })
    }

    static registry = {
        [TOPICS.POWER_PURCHASE_INITIATED_BY_CUSTOMER]: this.handleTokenRequest,
        [TOPICS.TOKEN_RECIEVED_FROM_VENDOR]: this.handleTokenReceived,
        [TOPICS.GET_TRANSACTION_TOKEN_REQUESTED_FROM_VENDOR_RETRY]: this.requeryTransactionForToken,
        [TOPICS.POWER_PURCHASE_INITIATED_BY_CUSTOMER_REQUERY]: this.requeryTransactionForToken,
    }
}

export default class TokenConsumer extends ConsumerFactory {
    constructor() {
        const messageProcessor = new MessageProcessor(TokenHandler.registry, 'TOKEN_CONSUMER')
        super(messageProcessor)
    }
}