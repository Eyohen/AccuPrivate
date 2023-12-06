import { TOPICS } from "../../Constants";
import ConsumerFactory from "../util/Consumer";
import { Topic } from "../util/Interface";
import MessageProcessor from "../util/MessageProcessor";

export default class CrmConsumer extends ConsumerFactory {
    constructor() {
        const messageProcessor = new MessageProcessor()

        const topics: Topic[] = [TOPICS.TOKEN_REQUESTED, TOPICS.TOKEN_RECEIVED]
        super(messageProcessor, topics)
    }
}