import { TOPICS } from "../../Constants";
import ProducerFactory from "../../util/Producer";

export default class Producer extends ProducerFactory {
    constructor() {
        super()
    }

    static async sendTransaction(transaction: any) {
        await this.producer.send({
            topic: TOPICS.TOKEN_REQUESTED,
            messages: [
                { value: JSON.stringify(transaction) }
            ]
        })
    }
}