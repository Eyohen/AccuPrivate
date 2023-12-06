import ConsumerRouter from "./modules/consumers";
import ProducerFactory from "./modules/util/Producer";

export default class KafkaService {
    static async start() {
        await ProducerFactory.start()
        await ConsumerRouter.init()
    }
}