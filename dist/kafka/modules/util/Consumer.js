"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = __importDefault(require("../../../utils/Logger"));
const config_1 = __importDefault(require("../../config"));
const crypto_1 = require("crypto");
class ConsumerFactory {
    constructor(messageProcessor) {
        this.messageProcessor = messageProcessor;
        this.kafkaConsumer = this.createKafkaConsumer();
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            const subscription = {
                topics: this.messageProcessor.getTopics(),
                fromBeginning: false,
            };
            try {
                yield this.kafkaConsumer.connect();
                yield this.kafkaConsumer.subscribe(subscription);
                yield this.kafkaConsumer.run({
                    eachMessage: (messagePayload) => this.messageProcessor.processEachMessage(messagePayload)
                });
            }
            catch (error) {
                console.error(error);
            }
            finally {
                return this;
            }
        });
    }
    startBatchConsumer() {
        return __awaiter(this, void 0, void 0, function* () {
            const topic = {
                topics: this.messageProcessor.getTopics(),
                fromBeginning: false,
            };
            try {
                yield this.kafkaConsumer.connect();
                yield this.kafkaConsumer.subscribe(topic);
                yield this.kafkaConsumer.run({
                    eachBatch: (messagePayload) => this.messageProcessor.processEachBatch(messagePayload)
                });
            }
            catch (error) {
                Logger_1.default.info(error);
            }
        });
    }
    shutdown() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.kafkaConsumer.disconnect();
        });
    }
    createKafkaConsumer() {
        const uuid = (0, crypto_1.randomUUID)();
        const consumer = config_1.default.consumer({ groupId: this.messageProcessor.getConsumerName() + uuid });
        return consumer;
    }
}
exports.default = ConsumerFactory;
