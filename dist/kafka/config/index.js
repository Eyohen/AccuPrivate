"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const kafkajs_1 = __importDefault(require("kafkajs"));
const fs_1 = require("fs");
const Constants_1 = require("../../utils/Constants");
const kafkaConfig = Constants_1.NODE_ENV === "development"
    ? {
        clientId: Constants_1.KAFKA_CLIENT_ID,
        brokers: [Constants_1.KAFKA_BROKER],
        logLevel: isNaN(parseInt(Constants_1.KAFA_LOGS)) ? 0 : parseInt(Constants_1.KAFA_LOGS),
    }
    : Constants_1.KAFKA_ENV === "digitalocean"
        ? {
            clientId: Constants_1.KAFKA_CLIENT_ID,
            brokers: [Constants_1.KAFKA_BROKER],
            connectionTimeout: 450000,
            ssl: {
                rejectUnauthorized: false,
                ca: Constants_1.KAFKA_CA_CERT ? [Constants_1.KAFKA_CA_CERT] : [(0, fs_1.readFileSync)(__dirname + "/ca-certificate.crt", "utf-8")],
            },
            sasl: {
                mechanism: 'scram-sha-256',
                username: Constants_1.KAFKA_USERNAME,
                password: Constants_1.KAFKA_PASSWORD,
            },
            logLevel: isNaN(parseInt(Constants_1.KAFA_LOGS)) ? 0 : parseInt(Constants_1.KAFA_LOGS)
        }
        : {
            clientId: Constants_1.KAFKA_CLIENT_ID,
            brokers: [Constants_1.KAFKA_BROKER],
            connectionTimeout: 450000,
            ssl: true,
            sasl: {
                mechanism: "plain",
                username: Constants_1.KAFKA_USERNAME,
                password: Constants_1.KAFKA_PASSWORD,
            },
            logLevel: isNaN(parseInt(Constants_1.KAFA_LOGS)) ? 0 : parseInt(Constants_1.KAFA_LOGS),
        };
console.log(Constants_1.KAFKA_ENV);
const Kafka = new kafkajs_1.default.Kafka(kafkaConfig);
exports.default = Kafka;
