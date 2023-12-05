import logger from "../../../utils/Logger";
import { TOPICS } from "../../Constants";
import ProducerFactory from "../../util/Producer";

export default class Producer extends ProducerFactory {
    constructor() {
        super()
    }

    static async sendTransaction(transaction: any) {
        logger.info(`Sending transaction to kafka: ${JSON.stringify(transaction)}`)
        await this.producer.send({
            topic: TOPICS.TOKEN_REQUESTED,
            messages: [
                { value: JSON.stringify(transaction) }
            ]
        })
    }
}