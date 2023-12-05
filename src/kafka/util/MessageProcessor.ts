import { EachBatchPayload, EachMessagePayload } from "kafkajs";
import logger from "../../utils/Logger";

export default class MessageProcessorFactory {
    async processEachMessage(messagePayload: EachMessagePayload): Promise<void> {
        const { topic, partition, message } = messagePayload;
        logger.info('Received message')
        console.log({
            topic,
            partition,
            message: message.value?.toString()
        })

        // Log actual data of the message
        const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
        logger.info(`- ${prefix} ${message.key}#${message.value}`);
    }

    async processEachBatch(eachBatchPayload: EachBatchPayload): Promise<void> {
        const { batch } = eachBatchPayload;
        for (const message of batch.messages) {
            const prefix = `${batch.topic}[${batch.partition} | ${message.offset}] / ${message.timestamp}`;
            logger.info(`- ${prefix} ${message.key}#${message.value}`);
        }
    }
}
