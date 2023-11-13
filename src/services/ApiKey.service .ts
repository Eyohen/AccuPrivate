// Import necessary types and the Event model
import { Transaction } from "sequelize";
import ApiKey, { IApiKey } from "../models/ApiKey.model";
import { ICreateEvent, IEvent } from "../models/Event.model";
import Event from "../models/Event.model";
import logger from "../utils/Logger";

// EventService class for handling event-related operations
export default class ApiKeyService {

    // Method for adding a new event to the database
    static async addApiKey(data: IApiKey, transaction?: Transaction): Promise<ApiKey> {
        const apiKey = ApiKey.build(data);
        transaction ? await apiKey.save({ transaction }) : await apiKey.save();
        return apiKey;
    }

    static async viewSingleApiKey(key: string): Promise<ApiKey | null> {
        const apiKey = await ApiKey.findOne({ where: { key: key } });
        return apiKey;
    }

    static async viewActiveApiKeyByPartnerId(partnerId: string): Promise<ApiKey | null> {
        const apiKey = await ApiKey.findOne({ where: { partnerId: partnerId, active: true } });
        return apiKey;
    }

    static async viewSingleApiKeyById(id: string): Promise<ApiKey | null> {
        const apiKey = await ApiKey.findOne({ where: { id: id } });
        return apiKey;
    }

    static async viewAllApiKeys(): Promise<ApiKey[]> {
        const apiKeys = await ApiKey.findAll();
        return apiKeys;
    }
}
