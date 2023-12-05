import { Consumer, ConsumerSubscribeTopics } from 'kafkajs'
import { TOPICS } from '../Constants'
import logger from '../../utils/Logger'
import MessageProcessorFactory from './MessageProcessor'
import Kafka from '../config'

export default class ConsumerFactory {
    private kafkaConsumer: Consumer
    private messageProcessor: MessageProcessorFactory
    private topics: string[]

    public constructor(messageProcessor: MessageProcessorFactory, topics: string[]) {
        this.messageProcessor = messageProcessor
        this.topics = topics
        this.kafkaConsumer = this.createKafkaConsumer()
    }

    public async startConsumer(): Promise<void> {
        const topic: ConsumerSubscribeTopics = {
            topics: this.topics,
            fromBeginning: false
        }

        try {
            await this.kafkaConsumer.connect()
            await this.kafkaConsumer.subscribe(topic)

            await this.kafkaConsumer.run({
                eachMessage: this.messageProcessor.processEachMessage
            })
        } catch (error) {
            console.error(error)
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
        const consumer = Kafka.consumer({ groupId: 'consumer-group' })
        return consumer
    }
}
