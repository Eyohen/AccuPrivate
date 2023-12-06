import { TOPICS } from "../../Constants";
import ConsumerFactory from "../util/Consumer";
import { Topic } from "../util/Interface";
import MessageProcessor from "../util/MessageProcessor";

export default class UserConsumer extends ConsumerFactory {
    constructor() {
        const messageProcessor = new MessageProcessor()

        const topics: Topic[] = [TOPICS.METER_VALIDATION_REQUESTED, TOPICS.TOKEN_RECEIVED]
        super(messageProcessor, topics)
    }
}