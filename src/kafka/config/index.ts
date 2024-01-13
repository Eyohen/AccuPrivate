import kafka from "kafkajs";
import { readFileSync } from "fs";
import {
    KAFKA_BROKER,
    KAFKA_CLIENT_ID,
    KAFKA_PASSWORD,
    KAFKA_USERNAME,
    NODE_ENV,
    KAFKA_ENV,
    KAFKA_CA_CERT
} from "../../utils/Constants";

const kafkaConfig: kafka.KafkaConfig =
    NODE_ENV === "development"
        ? {
              clientId: KAFKA_CLIENT_ID,
              brokers: [KAFKA_BROKER],
              logLevel: 0,
          }
        : KAFKA_ENV === "digitalocean"
        ? {
              clientId: KAFKA_CLIENT_ID,
              brokers: [KAFKA_BROKER],
              connectionTimeout: 450000,
              ssl: {
                rejectUnauthorized: false,
                ca: KAFKA_CA_CERT ? [KAFKA_CA_CERT]: [readFileSync(__dirname+"/ca-certificate.crt", "utf-8")],
              },
              sasl: {
                mechanism: 'scram-sha-256',
                username: KAFKA_USERNAME,
                password: KAFKA_PASSWORD,
            },
    
            logLevel: 0
          }
        : {
              clientId: KAFKA_CLIENT_ID,
              brokers: [KAFKA_BROKER],
              connectionTimeout: 450000,
              ssl: true,
              sasl: {
                  mechanism: "plain",
                  username: KAFKA_USERNAME,
                  password: KAFKA_PASSWORD,
              },
              logLevel: 0,
          };
console.log(KAFKA_ENV)
const Kafka = new kafka.Kafka(kafkaConfig);

export default Kafka;
