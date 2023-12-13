import { Consumer, ConsumerSubscribeTopics, EachMessageHandler, EachMessagePayload } from 'kafkajs'
import logger from '../../../utils/Logger'
import MessageProcessorFactory from './MessageProcessor'
import Kafka from '../../config'
import { KafkaTopics, MessagePayload, Topic } from './Interface'
import { v4 as uuid } from 'uuid'
import { TOPICS } from '../../Constants'

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

    public async startBatchConsumer(_topic: Topic): Promise<void> {
        const topic: KafkaTopics = {
            topics: [_topic],
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
        const consumer = Kafka.consumer({ groupId: this.messageProcessor.getConsumerName() })
        return consumer
    }
}
