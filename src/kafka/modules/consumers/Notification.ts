import { AxiosError } from "axios";
import Transaction from "../../../models/Transaction.model";
import EntityService from "../../../services/Entity/Entity.service";
import EventService from "../../../services/Event.service";
import NotificationService from "../../../services/Notification.service";
import TransactionService from "../../../services/Transaction.service";
import TransactionEventService from "../../../services/TransactionEvent.service";
import WebhookService from "../../../services/Webhook.service";
import EmailService, { EmailTemplate } from "../../../utils/Email";
import logger from "../../../utils/Logger";
import NotificationUtil from "../../../utils/Notification";
import { TOPICS } from "../../Constants";
import ConsumerFactory from "../util/Consumer";
import { PublisherEventAndParameters, Registry, Topic } from "../util/Interface";
import MessageProcessor from "../util/MessageProcessor";
import { v4 as uuidv4 } from 'uuid';

class NotificationHandler extends Registry {
    private static async handleReceivedToken(data: PublisherEventAndParameters[TOPICS.TOKEN_RECIEVED_FROM_VENDOR]) {
        logger.info('Inside notification handler')
        const transaction = await TransactionService.viewSingleTransaction(data.transactionId)
        if (!transaction) {
            throw new Error(`Error fetching transaction with id ${data.transactionId}`)
        }

        const partnerEntity = await EntityService.viewSingleEntityByEmail(transaction.partner.email)
        if (!partnerEntity) {
            throw new Error(`Error fetching partner with email ${transaction.partner.email}`)
        }

        // Add notification successfull transaction
        const notification = await NotificationService.addNotification({
            id: uuidv4(),
            title: "Successful transaction",
            heading: "Successful ransaction",
            message: `
                Successtul transaction for ${data.meter.meterNumber} with amount ${transaction.amount}

                Bank Ref: ${transaction.bankRefId}
                Bank Comment: ${transaction.bankComment}
                Transaction Id: ${transaction.id},
                Token: ${data.meter.token}                    
                `,
            entityId: partnerEntity.id,
            read: false,
        });

        // Check if notifiecations have been sent to partner and user
        const notifyPartnerEvent = await EventService.viewSingleEventByTransactionIdAndType(transaction.id, TOPICS.TOKEN_SENT_TO_PARTNER)
        const notifyUserEvent = await EventService.viewSingleEventByTransactionIdAndType(transaction.id, TOPICS.TOKEN_SENT_TO_EMAIL)

        const transactionEventService = new TransactionEventService(transaction, {
            meterNumber: data.meter.meterNumber,
            vendType: transaction.meter.vendType,
            disco: data.meter.disco,
        }, transaction.superagent, transaction.partner.email)

        // If you've not notified the partner before, notify them
        if (!notifyPartnerEvent) {
            await NotificationUtil.sendNotificationToUser(
                partnerEntity.id,
                notification
            );
            await transactionEventService.addTokenSentToPartnerEvent()
        }

        // If you've not notified the user before, notify them
        if (!notifyUserEvent) {
            await EmailService.sendEmail({
                to: transaction.user.email,
                subject: "Token Purchase",
                html: await new EmailTemplate().receipt({
                    transaction: transaction,
                    meterNumber: data.meter.meterNumber,
                    token: data.meter.token,
                }),
            })
            await transactionEventService.addTokenSentToUserEmailEvent()
        }
        return
    }

    private static async failedTokenRequest(data: PublisherEventAndParameters[TOPICS.TOKEN_REQUEST_FAILED]) {
        logger.info('Inside notification handler')
        const transaction = await TransactionService.viewSingleTransaction(data.transactionId)
        if (!transaction) {
            throw new Error(`Error fetching transaction with id ${data.transactionId}`)
        }

        const partnerEntity = await EntityService.viewSingleEntityByEmail(transaction.partner.email)
        if (!partnerEntity) {
            throw new Error(`Error fetching partner with email ${transaction.partner.email}`)
        }

        // Add notification successfull transaction
        const notification = await NotificationService.addNotification({
            id: uuidv4(),
            title: "Failed transaction",
            heading: "Failed ransaction",
            message: `
                Failed transaction for ${data.meter.meterNumber} with amount ${transaction.amount}

                Bank Ref: ${transaction.bankRefId}
                Bank Comment: ${transaction.bankComment}
                Transaction Id: ${transaction.id},
                `,
            entityId: partnerEntity.id,
            read: false,
        });

        // Check if notifiecations have been sent to partner and user
        const notifyPartnerEvent = await EventService.viewSingleEventByTransactionIdAndType(transaction.id, TOPICS.TOKEN_REQUEST_FAILED)
        const notifyUserEvent = await EventService.viewSingleEventByTransactionIdAndType(transaction.id, TOPICS.TOKEN_REQUEST_FAILED)

        const transactionEventService = new TransactionEventService(transaction, {
            meterNumber: data.meter.meterNumber,
            vendType: transaction.meter.vendType,
            disco: data.meter.disco,
        }, transaction.superagent, transaction.partner.email)

        // If you've not notified the partner before, notify them
        if (!notifyPartnerEvent) {
            await NotificationUtil.sendNotificationToUser(
                partnerEntity.id,
                notification
            );
            await transactionEventService.addTokenRequestFailedNotificationToPartnerEvent()
        }

        // If you've not notified the user before, notify them
        if (!notifyUserEvent) {
            await EmailService.sendEmail({
                to: transaction.user.email,
                subject: "Token Purchase",
                html: await new EmailTemplate().failedTransaction({
                    transaction: transaction,
                }),
            })
            await transactionEventService.addTokenRequestFailedNotificationToPartnerEvent()
        }
        return
    }

    static registry = {
        [TOPICS.TOKEN_SENT_TO_PARTNER_RETRY]: this.handleReceivedToken,
        [TOPICS.TOKEN_RECIEVED_FROM_VENDOR]: this.handleReceivedToken,
        [TOPICS.TOKEN_REQUEST_FAILED]: this.failedTokenRequest
    }
}

export default class NotificationConsumer extends ConsumerFactory {
    constructor() {
        const messageProcessor = new MessageProcessor(NotificationHandler.registry, 'NOTIFICATION_CONSUMER')
        super(messageProcessor)
    }
}