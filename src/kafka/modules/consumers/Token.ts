import { Status } from "../../../models/Event.model";
import Meter from "../../../models/Meter.model";
import Transaction from "../../../models/Transaction.model";
import NotificationService from "../../../services/Notification.service";
import TransactionService from "../../../services/Transaction.service";
import VendorService from "../../../services/Vendor.service";
import logger from "../../../utils/Logger";
import { TOPICS } from "../../Constants";
import { VendorPublisher } from "../publishers/Vendor";
import ConsumerFactory from "../util/Consumer";
import { Registry, Topic } from "../util/Interface";
import MessageProcessor from "../util/MessageProcessor";

class TokenHandler extends Registry {
    private static async handleTokenRequest(data: {
        transactionId: string, meter: {
            meterNumber: string, disco: Transaction['disco'],
            vendType: Meter['vendType'],
        },
        phoneNumber: string;
        amount: string,
    }) {
        const tokenInfo = await VendorService.buyPowerVendToken({
            transactionId: data.transactionId,
            meterNumber: data.meter.meterNumber,
            disco: data.meter.disco,
            vendType: data.meter.vendType,
            amount: data.amount,
            phone: data.phoneNumber
        }).catch(e => e)

        const transaction = await TransactionService.viewSingleTransaction(data.transactionId)
        if (!transaction) {
            logger.error(`Error fetching transaction with id ${data.transactionId}`)
            return
        }

        const meter = await Meter.findOne({ where: { meterNumber: data.meter.meterNumber } })
        if (!meter) {
            logger.error(`Error fetching meter with meter number ${data.meter.meterNumber}`)
            return
        }

        const user = await transaction.$get('user')
        if (!user) {
            logger.error(`Error fetching user with id ${transaction.userId}`)
            return
        }

        const partnerEntity = await transaction.$get('partner')
        if (!partnerEntity) {
            logger.error(`Error fetching partner with id ${transaction.partnerId}`)
            return
        }
        
        if (!(tokenInfo instanceof Error)) {
            await VendorPublisher.publishEventForMeterValidationReceived({
                transactionId: transaction.id,
                user: {
                    name: user.name as string,
                    email: user.email,
                    address: user.address,
                    phoneNumber: user.phoneNumber,
                },
                partner: {
                    email: partnerEntity.email,
                },
                meter: {
                    id: meter.id,
                    meterNumber: meter.meterNumber,
                    disco: transaction.disco,
                    vendType: meter.vendType,
                    token: tokenInfo.token,
                },
            })
        })
        return
    }

    if(tokenInfo.message === 'Transaction timeout') {
    // TODO: Trigger event to requery transaction later
    return
}

await TransactionService.updateSingleTransaction(data.transactionId, { status: Status.FAILED })

        // TODO: Emit event to notify user of failed transaction

    }

    static registry = {
    [TOPICS.TOKEN_REQUESTED]: this.handleTokenRequest
}
}

export default class TokenConsumer extends ConsumerFactory {
    constructor() {
        const messageProcessor = new MessageProcessor(TokenHandler.registry)

        const topics: Topic[] = [TOPICS.TOKEN_REQUESTED, TOPICS.TOKEN_RECEIVED]
        super(messageProcessor, topics)
    }
}