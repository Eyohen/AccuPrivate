import { Consumer } from 'kafkajs'
import logger from '../../../utils/Logger'
import MessageProcessorFactory from './MessageProcessor'
import Kafka from '../../config'
import { KafkaTopics, MessagePayload } from './Interface'
import { randomUUID } from 'crypto'

export default class ConsumerFactory {
    private kafkaConsumer: Consumer
    private messageProcessor: MessageProcessorFactory

    constructor(messageProcessor: MessageProcessorFactory) {
        this.messageProcessor = messageProcessor
        this.kafkaConsumer = this.createKafkaConsumer()
    }

    public async start(): Promise<ConsumerFactory> {
        const subscription: KafkaTopics = {
            topics: this.messageProcessor.getTopics(),
            fromBeginning: false,
        }

        try {
            await this.kafkaConsumer.connect()
            await this.kafkaConsumer.subscribe(subscription)

            await this.kafkaConsumer.run({
                eachMessage: (messagePayload) => this.messageProcessor.processEachMessage(messagePayload as MessagePayload)
            })

        } catch (error) {
            console.error(error)
        } finally {
            return this
        }
    }

    public async startBatchConsumer(): Promise<void> {
        const topic: KafkaTopics = {
            topics: this.messageProcessor.getTopics(),
            fromBeginning: false,
        }

        try {
            await this.kafkaConsumer.connect()
            await this.kafkaConsumer.subscribe(topic)
            await this.kafkaConsumer.run({
                eachBatch: (messagePayload) => this.messageProcessor.processEachBatch(messagePayload)
            })
        } catch (error) {
            logger.info(error)
        }
    }

    public async shutdown(): Promise<void> {
        await this.kafkaConsumer.disconnect()
    }

    private createKafkaConsumer(): Consumer {
        const uuid = randomUUID()
        const consumer = Kafka.consumer({ groupId: this.messageProcessor.getConsumerName() + uuid })
        return consumer
    }
}
