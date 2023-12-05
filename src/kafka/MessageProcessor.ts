import { EachBatchPayload, EachMessagePayload } from "kafkajs";

export default class MessageProcessorFactory {
    async processEachMessage(messagePayload: EachMessagePayload): Promise<void> {
        const { topic, partition, message } = messagePayload;
        const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
        console.log(`- ${prefix} ${message.key}#${message.value}`);
    }

    async processEachBatch(eachBatchPayload: EachBatchPayload): Promise<void> {
        const { batch } = eachBatchPayload;
        for (const message of batch.messages) {
            const prefix = `${batch.topic}[${batch.partition} | ${message.offset}] / ${message.timestamp}`;
            console.log(`- ${prefix} ${message.key}#${message.value}`);
        }
    }
}
