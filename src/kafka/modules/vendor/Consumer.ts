import { TOPICS } from "../../Constants";
import ConsumerFactory from "../../util/Consumer";
import { Topic } from "../../util/Interface";
import MessageProcessor from "./MessageProcessor";

export default class Consumer extends ConsumerFactory {
    constructor() {
        const messageProcessor = new MessageProcessor()

        const topics: Topic[] = [TOPICS.TOKEN_REQUESTED, TOPICS.TOKEN_RECEIVED]
        super(messageProcessor, topics)
    }
}

new Consumer().startConsumer()