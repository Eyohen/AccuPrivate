import { ConsumerSubscribeTopics } from "kafkajs";
import { TOPICS } from "../../Constants";

export type Topic = TOPICS

export interface CustomMessageFormat {
    topic: Topic;
    partition: number;
    offset: string;
    value: Record<any, any>
    timestamp: string;
    headers: any;
}

export type MessageHandler = {
    [K in TOPICS]?: (messageData: CustomMessageFormat) => Promise<void>
}

export type KafkaTopics = Omit<ConsumerSubscribeTopics, 'topics'> & { topics: Topic[] } 