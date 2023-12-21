import { TOPICS } from "../../Constants";
import ConsumerFactory from "../util/Consumer";
import { Topic } from "../util/Interface";
import MessageProcessor from "../util/MessageProcessor";

export default class TransactionConsumer extends ConsumerFactory {
    constructor() {
        const messageProcessor = new MessageProcessor({}, 'TRANSACTION_CONSUMER')
        super(messageProcessor)
    }
}