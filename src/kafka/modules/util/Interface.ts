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


interface MeterInfo {
    meterNumber: string,
    disco: string,
    vendType: 'PREPAID' | 'POSTPAID'
}

interface User {
    name: string,
    address: string,
    phoneNumber: string,
    email: string
}

interface MeterValidationRequested {
    user: User,
    meter: MeterInfo,
    transactionId: string
}

interface Partner {
    email: string,
}

export interface PublisherEventAndParameters extends Record<TOPICS, any> {
    [TOPICS.METER_VALIDATION_REQUESTED]: {
        meter: MeterInfo,
        transactionId: string
    },
    [TOPICS.METER_VALIDATION_RECIEVED]: MeterValidationRequested,
    [TOPICS.POWER_PURCHASE_INITIATED]: {
        meter: MeterInfo & { id: string },
        transactionId: string
    },
    [TOPICS.TOKEN_REQUESTED]: {
        meter: MeterInfo & { id: string },
        user: User,
        partner: Partner,
        transactionId: string
    },
    [TOPICS.TOKEN_RECEIVED]: {
        meter: MeterInfo & { id: string, token: string },
        user: User,
        partner: Partner,
        transactionId: string
    },
    [TOPICS.PARTNER_TRANSACTION_COMPLETE]: {
        meter: MeterInfo & { id: string },
        partner: Partner,
        transactionId: string
    },
    [TOPICS.TOKEN_SENT_TO_PARTNER]: {
        meter: MeterInfo & { id: string },
        partner: Partner,
        transactionId: string
    },
    [TOPICS.TOKEN_SENT_TO_EMAIL]: {
        meter: MeterInfo & { id: string },
        user: User & { id: string },
        transactionId: string
    },
    [TOPICS.CRM_USER_INITIATED]: {
        user: User,
        transactionId: string
    },
    [TOPICS.CRM_USER_CONFIRMED]: {
        user: User & { id: string },
        transactionId: string
    },
} 

export type PublisherParamsUnion = {
    [K in keyof PublisherEventAndParameters]: {
        topic: K;
        message: PublisherEventAndParameters[K];
    };
}[keyof PublisherEventAndParameters];

export type MessageHandler = {
    [K in TOPICS]?: (data: PublisherEventAndParameters[K]) => Promise<void>
}

export type KafkaTopics = Omit<ConsumerSubscribeTopics, 'topics'> & { topics: Topic[] }

export abstract class Registry {
    static registry: MessageHandler = {}
}