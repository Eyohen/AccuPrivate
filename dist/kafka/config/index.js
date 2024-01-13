"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const kafkajs_1 = __importDefault(require("kafkajs"));
const Constants_1 = require("../../utils/Constants");
const kafkaConfig = Constants_1.NODE_ENV === 'development'
    ? {
        clientId: Constants_1.KAFKA_CLIENT_ID,
        brokers: [Constants_1.KAFKA_BROKER],
        logLevel: 0
    }
    : {
        clientId: Constants_1.KAFKA_CLIENT_ID,
        brokers: [Constants_1.KAFKA_BROKER],
        connectionTimeout: 450000,
        ssl: true,
        sasl: {
            mechanism: 'plain',
            username: Constants_1.KAFKA_USERNAME,
            password: Constants_1.KAFKA_PASSWORD,
        },
        logLevel: 0,
    };
const Kafka = new kafkajs_1.default.Kafka(kafkaConfig);
exports.default = Kafka;
