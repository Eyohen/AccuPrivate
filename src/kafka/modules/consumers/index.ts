import CrmConsumer from "./Crm";
import InventoryConsumer from "./Inventory";
import NotificationConsumer from "./Notification";
import PartnerConsumer from "./Partner";
import TokenConsumer from "./Token";
import TransactionConsumer from "./Transaction";
import UserConsumer from "./User";
import VendorConsumer from "./Vendor";
import WebhookConsumer from "./Webhook";

export default class ConsumerRouter {
    static async init() {
        new CrmConsumer().start();
        new InventoryConsumer().start();
        new NotificationConsumer().start();
        new PartnerConsumer().start();
        new TokenConsumer().start();
        new TransactionConsumer().start();
        new UserConsumer().start();
        new VendorConsumer().start();
        // new WebhookConsumer().start();
    }
}

