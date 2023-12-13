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
import { PublisherEventAndParameters, Registry } from "../util/Interface";
import MessageProcessor from "../util/MessageProcessor";
import { v4 as uuidv4 } from 'uuid';

interface EventMessage {
    meter: { meterNumber: string, disco: Transaction['disco'], vendType: Meter['vendType'] },
    transactionId: string
}

class TokenHandler extends Registry {
    private static async triggerEventToRequeryToken({ eventService, eventMessage, timedOut }: { eventService: TransactionEventService, eventMessage: EventMessage, timedOut: boolean }) {
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
        if (timedOut) {
            await eventService.addTokenRequestTimedOutEvent()
            return await VendorPublisher.publishEventForTimedOutTokenRequest(eventMessage)
        }

        await eventService.addTokenRequestTimedOutEvent()
        return await VendorPublisher.publishEventForTransactionRequery(eventMessage)
    }

    private static async handleTokenRequest(data: PublisherEventAndParameters[TOPICS.TOKEN_REQUESTED_FROM_VENDOR]) {
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
                vendType: meter.vendType
            },
            transactionId: transaction.id
        }

        const transactionEventService = new TransactionEventService(transaction, eventMessage.meter)
        // Check if error occured while purchasing token
        if (tokenInfo instanceof Error) {
            if (tokenInfo instanceof AxiosError) {
                // If error is due to timeout, trigger event to requery transaction later
                if (tokenInfo.message === 'Transaction timeout') {
                    return await this.triggerEventToRequeryToken({ eventService: transactionEventService, eventMessage, timedOut: true })
                }

                // TODO: Check if event should be retried or we should finalize as failed
                /**
                 * 202 - Timeout / Transaction is processing
                 * 501 - Maintenance error
                 * 500 - Unexpected error - Please requery
                 */
                const responseCode = tokenInfo.response?.data.responseCode
                const requeryTxn = [202, 500, 501].includes(tokenInfo.response?.data.responseCode as number)
                if (requeryTxn) {
                    return await this.triggerEventToRequeryToken({ eventService: transactionEventService, eventMessage, timedOut: responseCode === 202 })
                }
            }

            logger.error('Error purchasing token', tokenInfo)
            // Transaction failed, trigger event to retry transaction from scratch
            // TODO: Add timer to trigger it at increasing intervals
            await transactionEventService.addTokenRequestFailedNotificationToPartnerEvent()
            await VendorPublisher.publishEventForFailedTokenRequest(eventMessage)
            return
        }

        // Handle transaction if it timedout or successful
        const transactionTimedOut = tokenInfo.data.responseCode == 202
        const transactionSuccessFull = tokenInfo.data.responseCode == 200
        const tokenInResponse = (tokenInfo as PurchaseResponse).data.token

        // Transaction timedout - Requery the transactio at intervals
        if (transactionTimedOut) {
            logger.info('Transaction timedout')
            // Trigger event to requery transaction later
            return await this.triggerEventToRequeryToken({ eventService: transactionEventService, eventMessage, timedOut: true })
        }

        // Transaction is successful but there is no token in the response
        if (!tokenInResponse) {
            // Publish event for no token in response - This should requery the transaction
            logger.info('Transaction successful but no token in response')
            await transactionEventService.addTokenRequestTimedOutEvent()
            await VendorPublisher.publishEventForSuccessfulTokenRequestWithNoToken({
                transactionId: transaction.id,
                meter: eventMessage.meter
            })
            return
        }

        // Token purchase was successful
        // And token was found in request
        // Add and publish token received event
        const _tokenInfo = tokenInfo as PurchaseResponse
        await transactionEventService.addTokenReceivedEvent(_tokenInfo.data.token);
        await VendorPublisher.publishEventForReceivedToken({
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

        return
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

    private static async requeryTransactionForToken(data: PublisherEventAndParameters[TOPICS.TOKEN_REQUESTED_FROM_VENDOR_REQUERY]) {
        // Check if token has been found
        const transaction = await TransactionService.viewSingleTransaction(data.transactionId)
        if (!transaction) {
            logger.error('Transaction not found')
            return
        }

        // Requery transaction from provider and update transaction status
        const requeryResult = await VendorService.buyPowerRequeryTransaction({ transactionId: transaction.reference })
        const transactionSuccess = requeryResult.responseCode === 200
        if (!transactionSuccess) {
            logger.error(`Error requerying transaction with id ${data.transactionId}`)
            // TODO: Trigger requery transaction at interval
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
        [TOPICS.TOKEN_REQUESTED_FROM_VENDOR]: this.handleTokenRequest,
        [TOPICS.TOKEN_RECIEVED_FROM_VENDOR]: this.handleTokenReceived,
        [TOPICS.TOKEN_REQUEST_TIMEDOUT]: this.requeryTransactionForToken,
        [TOPICS.TOKEN_REQUESTED_FROM_VENDOR_REQUERY]: this.requeryTransactionForToken,
    }
}

export default class TokenConsumer extends ConsumerFactory {
    constructor() {
        const messageProcessor = new MessageProcessor(TokenHandler.registry, 'TOKEN_CONSUMER')
        super(messageProcessor)
    }
}