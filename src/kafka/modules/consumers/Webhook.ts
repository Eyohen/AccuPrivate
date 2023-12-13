import { AxiosError } from "axios";
import EntityService from "../../../services/Entity/Entity.service";
import EventService from "../../../services/Event.service";
import TransactionService from "../../../services/Transaction.service";
import TransactionEventService from "../../../services/TransactionEvent.service";
import WebhookService from "../../../services/Webhook.service";
import logger from "../../../utils/Logger";
import { TOPICS } from "../../Constants";
import ConsumerFactory from "../util/Consumer";
import { PublisherEventAndParameters, Registry, Topic } from "../util/Interface";
import MessageProcessor from "../util/MessageProcessor";

class WebhookHandler extends Registry {
    private static async handleWebhookRequest(data: PublisherEventAndParameters[TOPICS.WEBHOOK_NOTIFICATION_SENT_TO_PARTNER]) {
        const transaction = await TransactionService.viewSingleTransaction(data.transactionId)
        if (!transaction) {
            logger.error(`Error fetching transaction with id ${data.transactionId}`)
            return
        }

        const partnerEntity = await EntityService.viewSingleEntityByEmail(transaction.partner.email)
        if (!partnerEntity) {
            logger.error(`Error fetching partner with email ${transaction.partner.email}`)
            return
        }

        const webhook = await WebhookService.viewWebhookByPartnerId(partnerEntity.id)
        if (!webhook) {
            logger.error(`Error fetching webhook for partner with id ${partnerEntity.id}`)
            return
        }

        const notifyPartnerEvent = await EventService.viewSingleEventByTransactionIdAndType(transaction.id, TOPICS.WEBHOOK_NOTIFICATION_SENT_TO_PARTNER)
        if (notifyPartnerEvent) {
            logger.info(`Webhook notification already sent for transaction with id ${transaction.id}`)
            return
        }

        const transactionNotificationData = {
            status: 'SUCCESS',
            transaction: {
                reference: transaction.bankRefId,
                comment: transaction.bankComment,
                amount: transaction.amount,
                date: transaction.createdAt,
                powerUnit: transaction.powerUnit,
                meter: transaction.meter,
                user: {
                    email: transaction.user.email,
                    name: transaction.user.name,
                }
            }
        }
        const response = await WebhookService.sendWebhookNotification(webhook, transactionNotificationData).catch(e => e)
        const transactionEventService = new TransactionEventService(transaction, { meterNumber: transaction.meter.meterNumber, disco: transaction.disco, vendType: transaction.meter.vendType })
        await transactionEventService.addWebHookNotificationSentEvent()
        const webhookUrlNotSet = response instanceof Error && response.message === 'Webhook url not found'
        if (webhookUrlNotSet) {
            logger.error(`Webhook url not set for Partner - Notification can't be sent`)
            return
        }

        const axiosError = response instanceof AxiosError
        if (axiosError) {
            // TODO: Setup request for a later time
            logger.info('No response from the user, setting up request for a later time')
            return
        }

        await transactionEventService.addWebHookNotificationConfirmedEvent()
    }

    static registry = {
        [TOPICS.TOKEN_RECIEVED_FROM_VENDOR]: this.handleWebhookRequest
    }
}

export default class WebhookConsumer extends ConsumerFactory {
    constructor() {
        const messageProcessor = new MessageProcessor(WebhookHandler.registry, 'WEBHOOK_CONSUMER')
        super(messageProcessor)
    }
}