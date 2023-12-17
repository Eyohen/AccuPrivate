import { ConsumerSubscribeTopics, EachMessagePayload } from "kafkajs";
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
    [TOPICS.METER_VALIDATION_REQUESTED_TO_VENDOR]: {
        meter: MeterInfo,
        transactionId: string
    },
    [TOPICS.METER_VALIDATION_RECIEVED_FROM_VENDOR]: MeterValidationRequested,
    [TOPICS.POWER_PURCHASE_INITIATED_BY_CUSTOMER]: {
        meter: MeterInfo & { id: string },
        user: User,
        partner: Partner,
        transactionId: string
    },
    [TOPICS.TOKEN_RECIEVED_FROM_VENDOR]: {
        meter: MeterInfo & { id: string, token: string },
        user: User,
        partner: Partner,
        transactionId: string
    },
    [TOPICS.GET_TRANSACTION_TOKEN_REQUESTED_FROM_VENDOR_RETRY]: {
        meter: MeterInfo & { id: string },
        transactionId: string,
        timeStamp: Date,
        error: { code: number, cause: string },
        retryCount: number
    },
    [TOPICS.GET_TRANSACTION_TOKEN_FROM_VENDOR_INITIATED]: {
        meter: MeterInfo & { id: string },
        transactionId: string,
        timeStamp: Date,
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
    [TOPICS.CREATE_USER_INITIATED]: {
        user: User,
        transactionId: string
    },
    [TOPICS.CREATE_USER_CONFIRMED]: {
        user: User & { id: string },
        transactionId: string
    },
    [TOPICS.TOKEN_REQUEST_FAILED]: {
        transactionId: string,
        meter: MeterInfo
    },
    [TOPICS.TOKEN_REQUEST_TIMEDOUT]: {
        transactionId: string,
        meter: MeterInfo
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

export type MessagePayload = EachMessagePayload & { topic: TOPICS }