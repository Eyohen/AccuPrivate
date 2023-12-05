import Producer from "./Producer";
import Consumer from "./Consumer";

export default class TransactionModule {
    static producer = Producer
    static consumer = Consumer
}