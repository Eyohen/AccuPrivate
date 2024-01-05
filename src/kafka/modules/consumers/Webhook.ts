import { AxiosError } from "axios";
import EntityService from "../../../services/Entity/Entity.service";
import EventService from "../../../services/Event.service";
import TransactionService from "../../../services/Transaction.service";
import TransactionEventService from "../../../services/TransactionEvent.service";
import WebhookService from "../../../services/Webhook.service";
import logger from "../../../utils/Logger";
import { TOPICS } from "../../Constants";
import ConsumerFactory from "../util/Consumer";
import {
    MeterInfo,
    PublisherEventAndParameters,
    Registry,
    Topic,
} from "../util/Interface";
import MessageProcessor from "../util/MessageProcessor";
import { PartnerProfile } from "../../../models/Entity/Profiles";
import { PartnerProfileService } from "../../../services/Entity/Profiles";
import { pbkdf2 } from "crypto";
import { VendorPublisher } from "../publishers/Vendor";
import Meter, { IMeter } from "../../../models/Meter.model";
import MeterService from "../../../services/Meter.service";
import Transaction from "../../../models/Transaction.model";
import User from "../../../models/User.model";
import WebHook from "../../../models/Webhook.model";
import { ValueOf } from "kafkajs";
import { getCurrentWaitTimeForRequeryEvent } from "./Token";

class WebhookHandlerRequestValidator {
    static async validateIncomingWebhookEventRequest(
        data: PublisherEventAndParameters[TOPICS.TOKEN_RECIEVED_FROM_VENDOR],
    ): Promise<
        | {
              transaction: Transaction;
              partnerProfile: PartnerProfile;
              meter: Meter;
              user: User;
              webhook: WebHook;
          }
        | Error
    > {
        try {
            const transaction = await TransactionService.viewSingleTransaction(
                data.transactionId,
            );
            if (!transaction) {
                throw new Error(
                    `Error fetching transaction with id ${data.transactionId}`,
                );
            }

            const user = await transaction.$get("user");
            if (!user) {
                throw new Error(
                    "User not found for transaction with id " + transaction.id,
                );
            }
            const partnerProfile =
                await PartnerProfileService.viewSinglePartnerByEmail(
                    transaction.partner.email,
                );
            if (!partnerProfile) {
                throw new Error(
                    `Error fetching partner with email ${transaction.partner.email}`,
                );
            }

            const meter = await transaction.$get("meter");
            if (!meter) {
                throw new Error(
                    `No meter found for transaction id ${transaction.id}`,
                );
            }

            const webhook = await WebhookService.viewWebhookByPartnerId(
                partnerProfile.id,
            );
            if (!webhook) {
                throw new Error(
                    `Error fetching webhook for partner with id ${partnerProfile.id}`,
                );
            }

            return {
                transaction,
                partnerProfile,
                webhook,
                user,
                meter,
            };
        } catch (error: Error | any) {
            logger.error(error.message);
            return error;
        }
    }
}

type WebhookEventRequestParams = {
    Retry: RetryWebhookParams;
    FirstTime: WebhookParamsBase;
};

class WebhookParamsBase {
    meter: MeterInfo & { id: string; token: string };
    user: { name: string; address: string; phoneNumber: string; email: string };
    partner: { email: string };
    transactionId: string;
}

class RetryWebhookParams extends WebhookParamsBase {
    retryCount: number;
}

enum Status {
    RETRY = "Retry",
    FIRST_TIME = "FirstTime",
}
class WebhookHandler extends Registry {
    private static async handleWebhookRequest<T extends Status>(
        data: WebhookEventRequestParams[T],
    ) {
        const validationData =
            await WebhookHandlerRequestValidator.validateIncomingWebhookEventRequest(
                data,
            );
        if (validationData instanceof Error) {
            logger.info(
                `A error occured while validating new webhook request for transaction with id ${data.transactionId}`,
            );
            return;
        }

        const { transaction, partnerProfile, meter, user, webhook } =
            validationData;
        const transactionEventService = new TransactionEventService(
            transaction,
            {
                meterNumber: transaction.meter.meterNumber,
                disco: transaction.disco,
                vendType: transaction.meter.vendType,
            },
            transaction.superagent,
            transaction.partner.email,
        );

        try {
            const notifyPartnerEvent =
                await EventService.viewSingleEventByTransactionIdAndType(
                    transaction.id,
                    TOPICS.WEBHOOK_NOTIFICATION_SENT_TO_PARTNER,
                );
            if (notifyPartnerEvent) {
                logger.info(
                    `Webhook notification already sent for transaction with id ${transaction.id}`,
                );
                return;
            }

            const powerUnit = await transaction.$get("powerUnit");

            // TODO: Add webhook case for failed transaction
            const transactionNotificationData = {
                status: "SUCCESS",
                data: {
                    transaction: {
                        reference: transaction.bankRefId,
                        comment: transaction.bankComment,
                        amount: transaction.amount,
                        date: transaction.createdAt,
                        powerUnit: powerUnit,
                        meter: data.meter,
                        user: data.user,
                    },
                    token: data.meter.token,
                },
            };
            const response = await WebhookService.sendWebhookNotification(
                webhook,
                transactionNotificationData,
            ).catch((e) => e);

            await transactionEventService.addWebHookNotificationSentEvent();
            const webhookUrlNotSet =
                response instanceof Error &&
                response.message === "Webhook url not found";
            if (webhookUrlNotSet) {
                logger.error(
                    `Webhook url not set for Partner - Notification can't be sent`,
                );
                return;
            }

            const axiosError = response instanceof AxiosError;
            if (axiosError) {
                // TODO: Setup request for a later time
                logger.info(
                    "No response from the user, setting up request for a later time",
                );
                return;
            }

            await transactionEventService.addWebHookNotificationConfirmedEvent();
        } catch (error: Error | any) {
            const metaData = {
                url: webhook.url,
                token: data.meter.token,
                meter: transaction.meter,
                retryCount:
                    data instanceof RetryWebhookParams ? data.retryCount : null,
            };

            //     await this.scheduleNextWebhookNotification(
            //         transactionEventService,
            //         metaData,
            //     );
        }
    }

    private static async scheduleNextWebhookNotification(
        eventService: TransactionEventService,
        meta: {
            retryCount: number | null;
            meter: IMeter;
            token: string;
            url: string;
        },
    ) {
        const retryCount = meta.retryCount ?? 0;
        const waitTime = getCurrentWaitTimeForRequeryEvent(retryCount);

        setTimeout(async () => {
            await eventService.addWebHookNotificationRetryEvent({
                retryCount: retryCount,
                timeStamp: new Date(),
                url: meta.url,
            });

            const partner = await eventService
                .getTransactionInfo()
                .$get("partner");
            if (!partner) {
                throw new Error("Partner not found for transaction");
            }

            const user = await eventService.getTransactionInfo().$get("user");
            if (!user) {
                throw new Error("User not found for transaction");
            }

            const transaction = await TransactionService.viewSingleTransaction(eventService.getTransactionInfo().id)
            if (!transaction) {
                throw new Error("Transaction not found")
            }

            await VendorPublisher.publishEventForWebhookNotificationToPartnerRetry(
                {
                    meter: {
                        ...meta.meter,
                        token: meta.token,
                    },
                    partner: partner,
                    retryCount: retryCount + 1,
                    user: {
                        name: user.name as string,
                        email: user.email,
                        address: user.address,
                        phoneNumber: user.phoneNumber,
                    },
                    transactionId: eventService.getTransactionInfo().id,
                    superAgent: transaction.superagent
                },
            );
        }, waitTime);
    }

    static registry = {
        [TOPICS.TOKEN_RECIEVED_FROM_VENDOR]: this
            .handleWebhookRequest<Status.FIRST_TIME>,
        [TOPICS.WEBHOOK_NOTIFICATION_TO_PARTNER_RETRY]: this
            .handleWebhookRequest<Status.RETRY>,
    };
}

export default class WebhookConsumer extends ConsumerFactory {
    constructor() {
        const messageProcessor = new MessageProcessor(
            WebhookHandler.registry,
            "WEBHOOK_CONSUMER",
        );
        super(messageProcessor);
    }
}
