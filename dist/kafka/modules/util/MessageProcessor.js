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
class MessageProcessorFactory {
    constructor(handlers, consumerName) {
        this.handlers = () => handlers !== null && handlers !== void 0 ? handlers : {};
        this.consumerName = consumerName;
    }
    processMessage(messageData) {
        return __awaiter(this, void 0, void 0, function* () {
            const handler = this.handlers()[messageData.topic];
            if (!handler) {
                Logger_1.default.error(`No handler for topic ${messageData.topic}`);
                return;
            }
            try {
                yield handler(messageData.value);
            }
            catch (error) {
                throw error;
            }
        });
    }
    processEachMessage(messagePayload) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const { topic, partition, message } = messagePayload;
            const prefix = `[${topic}][${partition} | ${message.offset}] / ${message.timestamp}`;
            Logger_1.default.info(`Received message => [${this.consumerName}]: ` + prefix);
            const data = {
                topic,
                partition,
                offset: message.offset,
                value: JSON.parse((_b = (_a = message.value) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '{}'),
                timestamp: message.timestamp,
                headers: message.headers,
            };
            return yield this.processMessage(data);
        });
    }
    processEachBatch(eachBatchPayload) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const { batch } = eachBatchPayload;
            for (batch.messages.length - 1; batch.messages.length >= 0; batch.messages.length--) {
                const message = batch.messages[batch.messages.length - 1];
                const prefix = `${batch.topic}[${batch.partition} | ${message.offset}] / ${message.timestamp}`;
                Logger_1.default.info(`- ${prefix} ${message.key}#${message.value}`);
                const data = {
                    topic: batch.topic,
                    partition: batch.partition,
                    offset: message.offset,
                    value: JSON.parse((_b = (_a = message.value) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '{}'),
                    timestamp: message.timestamp,
                    headers: message.headers,
                };
                yield this.processMessage(data);
                Logger_1.default.info('Processing batch...');
            }
            yield eachBatchPayload.commitOffsetsIfNecessary();
            yield eachBatchPayload.heartbeat();
            Logger_1.default.info('Committing offsets...');
        });
    }
    getTopics() {
        return Object.keys(this.handlers());
    }
    getConsumerName() {
        return this.consumerName;
    }
}
exports.default = MessageProcessorFactory;
