import { TOPICS } from "../../Constants";
import ConsumerFactory from "../util/Consumer";
import { Topic } from "../util/Interface";
import MessageProcessor from "../util/MessageProcessor";

export default class UserConsumer extends ConsumerFactory {
    constructor() {
        const messageProcessor = new MessageProcessor({}, 'USER_CONSUMER')
        super(messageProcessor)
    }
}