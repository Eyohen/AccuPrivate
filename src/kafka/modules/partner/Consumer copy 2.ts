import ConsumerFactory from "../../util/Consumer";
import MessageProcessor from "./MessageProcessor";

export default class Consumer extends ConsumerFactory {
    constructor() {
        const messageProcessor = new MessageProcessor()
        super(messageProcessor)
    }
}