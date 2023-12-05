import { Message, ProducerBatch, TopicMessages } from 'kafkajs'
import Kafka from './config'
import logger from '../utils/Logger'
import { TOPICS } from './Constants'

interface CustomMessageFormat { a: string }

export default class ProducerFactory {
    private static producer = Kafka.producer()

    static async start(): Promise<void> {
        try {
            await this.producer.connect()
        } catch (error) {
            logger.error('Error connecting the producer: ', error)
        }
    }

    static async shutdown(): Promise<void> {
        await this.producer.disconnect()
    }

    static async sendBatch({ messages, topic }: { messages: Array<CustomMessageFormat>, topic: keyof typeof TOPICS }): Promise<void> {
        const kafkaMessages: Array<Message> = messages.map((message) => {
            return {
                value: JSON.stringify(message)
            }
        })

        const topicMessages: TopicMessages = {
            topic: topic,
            messages: kafkaMessages
        }

        const batch: ProducerBatch = {
            topicMessages: [topicMessages]
        }

        await this.producer.sendBatch(batch)
    }
}
// 