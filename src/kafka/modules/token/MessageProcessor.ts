import { EachMessagePayload } from "kafkajs";
import MessageProcessorFactory from "../../util/MessageProcessor";
import logger from "../../../utils/Logger";

export default class MessageProcessor extends MessageProcessorFactory {
    constructor() {
        super()
    }

    async processEachMessage(messagePayload: EachMessagePayload): Promise<void> {
        const { topic, partition, message } = messagePayload;

        logger.info('Received message from kafka:')
        logger.info(`- ${topic}[${partition} | ${message.offset}] / ${message.timestamp}`);
    }
}   