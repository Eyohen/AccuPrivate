import kafka from 'kafkajs'
import { KAFKA_BROKER, KAFKA_CLIENT_ID } from '../../utils/Constants'

const kafkaConfig: kafka.KafkaConfig = {
    clientId: KAFKA_CLIENT_ID,
    brokers: [KAFKA_BROKER],
}

const Kafka = new kafka.Kafka(kafkaConfig)

export default Kafka