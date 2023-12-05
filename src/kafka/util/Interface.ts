import { ConsumerSubscribeTopics } from "kafkajs";
import { TOPICS } from "../Constants";

export type Topic = keyof typeof TOPICS

export interface CustomMessageFormat {
    topic: Topic;
    partition: number;
    offset: string;
    value: Record<any, any>
    timestamp: string;
    headers: any;
}

export type MessageHandler = Record<Topic, (messageData: CustomMessageFormat) => Promise<void>>

export type KafkaTopics = Omit<ConsumerSubscribeTopics, 'topics'> & { topics: Topic[] } 