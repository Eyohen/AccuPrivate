import { EachBatchPayload, EachMessagePayload, Message } from "kafkajs";
import logger from "../../utils/Logger";
import { CustomMessageFormat, MessageHandler, Topic } from "./Interface";



export default class MessageProcessorFactory {
    private handlers: MessageHandler

    constructor(handlers?: MessageHandler) {
        this.handlers = handlers ?? {} as MessageHandler
    }

    private async processMessage(messageData: CustomMessageFormat) {
        const handler = this.handlers[messageData.topic]
        if (!handler) {
            logger.error(`No handler for topic ${messageData.topic}`)
            return
        }

        await handler(messageData)
    }

    public async processEachMessage(messagePayload: Omit<EachMessagePayload, 'topic'> & { topic: Topic }): Promise<void> {
        const { topic, partition, message } = messagePayload;

        const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
        logger.info('Received message: ' + prefix + ' ' + message.value?.toString())

        const data: CustomMessageFormat = {
            topic,
            partition,
            offset: message.offset,
            value: JSON.parse(message.value?.toString() ?? '{}'),
            timestamp: message.timestamp,
            headers: message.headers,
        }

        await this.processMessage(data)
    }

    public async processEachBatch(eachBatchPayload: EachBatchPayload): Promise<void> {
        const { batch } = eachBatchPayload;
        for (const message of batch.messages) {
            const prefix = `${batch.topic}[${batch.partition} | ${message.offset}] / ${message.timestamp}`;
            logger.info(`- ${prefix} ${message.key}#${message.value}`);
        }
    }
}
