import { Consumer, ConsumerSubscribeTopics, EachMessageHandler } from 'kafkajs'
import logger from '../../../utils/Logger'
import MessageProcessorFactory from './MessageProcessor'
import Kafka from '../../config'
import { KafkaTopics, Topic } from './Interface'

export default class ConsumerFactory {
    private kafkaConsumer: Consumer
    private messageProcessor: MessageProcessorFactory
    private topics: Topic[]

    public constructor(messageProcessor: MessageProcessorFactory, topics: Topic[]) {
        this.messageProcessor = messageProcessor
        this.topics = topics
        this.kafkaConsumer = this.createKafkaConsumer()
    }

    public async start(): Promise<void> {
        const topic: KafkaTopics = {
            topics: this.topics,
            fromBeginning: false
        }

        try {
            await this.kafkaConsumer.connect()
            await this.kafkaConsumer.subscribe(topic)

            await this.kafkaConsumer.run({
                eachMessage: this.messageProcessor.processEachMessage as EachMessageHandler
            })
        } catch (error) {
            console.error(error)
        }
    }

    public async startBatchConsumer(_topic: Topic): Promise<void> {
        const topic: KafkaTopics = {
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
