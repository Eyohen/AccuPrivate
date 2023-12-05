import { Consumer, ConsumerSubscribeTopics, EachBatchPayload, Kafka, EachMessagePayload } from 'kafkajs'
import { TOPICS } from './Constants'
import logger from '../utils/Logger'
import MessageProcessorFactory from './MessageProcessor'

export default class ConsumerFactory {
    private kafkaConsumer: Consumer
    private messageProcessor: MessageProcessorFactory

    public constructor(messageProcessor: MessageProcessorFactory) {
        this.messageProcessor = messageProcessor
        this.kafkaConsumer = this.createKafkaConsumer()
    }

    public async startConsumer(): Promise<void> {
        const topic: ConsumerSubscribeTopics = {
            topics: ['example-topic'],
            fromBeginning: false
        }

        try {
            await this.kafkaConsumer.connect()
            await this.kafkaConsumer.subscribe(topic)

            await this.kafkaConsumer.run({
                eachMessage: this.messageProcessor.processEachMessage
            })
        } catch (error) {
            logger.info(error)
        }
    }

    public async startBatchConsumer(_topic: keyof typeof TOPICS): Promise<void> {
        const topic: ConsumerSubscribeTopics = {
            topics: [_topic],
            fromBeginning: false
        }

        try {
            await this.kafkaConsumer.connect()
            await this.kafkaConsumer.subscribe(topic)
            await this.kafkaConsumer.run({
                eachBatch: this.messageProcessor.processEachBatch
            })
        } catch (error) {
            logger.info(error)
        }
    }

    public async shutdown(): Promise<void> {
        await this.kafkaConsumer.disconnect()
    }

    private createKafkaConsumer(): Consumer {
        const kafka = new Kafka({
            clientId: 'client-id',
            brokers: ['example.kafka.broker:9092']
        })
        const consumer = kafka.consumer({ groupId: 'consumer-group' })
        return consumer
    }
}
