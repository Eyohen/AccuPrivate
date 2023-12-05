import ProducerFactory from "../../Producer";

export default class Producer extends ProducerFactory {
    constructor() {
        super()
    }

    static async sendTransaction (transaction: any) {
        await this.producer.send({
            topic: 'transaction',
            messages: [
                { value: JSON.stringify(transaction) }
            ]
        })
    }
}