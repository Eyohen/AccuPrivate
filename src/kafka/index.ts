import ProducerFactory from "./util/Producer";
import { VendorConsumer } from "./modules/user";

export default class KafkaService {
    private static async startConsumers() {
        await new VendorConsumer().startConsumer()
    }

    static async start() {
        await ProducerFactory.start()
        await this.startConsumers()
    }
}