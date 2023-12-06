import { ConsumerSubscribeTopics } from "kafkajs";
import { TOPICS } from "../../Constants";

export type Topic = TOPICS

export interface CustomMessageFormat {
    topic: Topic;
    partition: number;
    offset: string;
    value: any
    timestamp: string;
    headers: any;
}

export type MessageHandler = {
    [K in TOPICS]?: (messageData: CustomMessageFormat['value']) => Promise<void>
}

export type KafkaTopics = Omit<ConsumerSubscribeTopics, 'topics'> & { topics: Topic[] }

export abstract class Registry {
    static registry: Record<string, (...args: any) => Promise<void>>
}