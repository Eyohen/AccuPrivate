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
const config_1 = __importDefault(require("../../config"));
const Logger_1 = __importDefault(require("../../../utils/Logger"));
class ProducerFactory {
    static start() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.producer.connect();
            }
            catch (error) {
                Logger_1.default.error('Error connecting the producer: ', error);
            }
        });
    }
    static shutdown() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.producer.disconnect();
        });
    }
    static sendMessage({ topic, message }) {
        return __awaiter(this, void 0, void 0, function* () {
            Logger_1.default.info('Sending message to topic: ' + topic);
            try {
                yield this.producer.send({
                    topic: topic,
                    messages: [
                        {
                            value: JSON.stringify(message)
                        }
                    ]
                });
            }
            catch (error) {
                Logger_1.default.warn(error);
            }
        });
    }
    static sendBatch({ messages, topic }) {
        return __awaiter(this, void 0, void 0, function* () {
            const kafkaMessages = messages.map((message) => {
                return {
                    value: JSON.stringify(message)
                };
            });
            const topicMessages = {
                topic: topic,
                messages: kafkaMessages
            };
            const batch = {
                topicMessages: [topicMessages]
            };
            yield this.producer.sendBatch(batch);
        });
    }
}
ProducerFactory.producer = config_1.default.producer();
exports.default = ProducerFactory;
