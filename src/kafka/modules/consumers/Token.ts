import { Status } from "../../../models/Event.model";
import Meter from "../../../models/Meter.model";
import Transaction from "../../../models/Transaction.model";
import EventService from "../../../services/Event.service";
import PowerUnitService from "../../../services/PowerUnit.service";
import TransactionService from "../../../services/Transaction.service";
import VendorService from "../../../services/Vendor.service";
import { DISCO_LOGO, NODE_ENV } from "../../../utils/Constants";
import logger from "../../../utils/Logger";
import { TOPICS } from "../../Constants";
import { VendorPublisher } from "../publishers/Vendor";
import ConsumerFactory from "../util/Consumer";
import { PublisherEventAndParameters, Registry, Topic } from "../util/Interface";
import MessageProcessor from "../util/MessageProcessor";
import { v4 as uuidv4 } from 'uuid';

class TokenHandler extends Registry {
    private static async handleTokenRequest(data: PublisherEventAndParameters[TOPICS.TOKEN_REQUESTED]) {
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
        }).catch(e => e)


        // Check if error occured while purchasing token
        if (tokenInfo instanceof Error) {
            // If error is due to timeout, trigger event to requery transaction later
            if (tokenInfo.message === 'Transaction timeout') {
                // TODO: Emit event to notify partner of failed transaction (webhook)
                // TODO: Trigger event to requery transaction later
                return
            }

            // TODO: Emit event to notify partner of failed transaction (webhook)
            return
        }

        // Token purchase was successful
        // Add and publish token received event
        const transactionEventService = new EventService.transactionEventService(transaction, {
            meterNumber: meter.meterNumber,
            disco: meter.disco,
            vendType: meter.vendType,
        })
        await transactionEventService.addTokenReceivedEvent(tokenInfo.token);
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
                token: tokenInfo.token,
            },
        })

        return
    }

    private static async handleTokenReceived(data: PublisherEventAndParameters[TOPICS.TOKEN_RECEIVED]) {
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

    static registry = {
        [TOPICS.TOKEN_REQUESTED]: this.handleTokenRequest,
        [TOPICS.TOKEN_RECEIVED]: this.handleTokenReceived,
    }
}

export default class TokenConsumer extends ConsumerFactory {
    constructor() {
        const messageProcessor = new MessageProcessor(TokenHandler.registry, '41234')
        super(messageProcessor)
    }
}