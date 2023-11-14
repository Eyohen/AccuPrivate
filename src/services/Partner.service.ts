import { Transaction, UUIDV4 } from "sequelize";
import Partner, { IPartner } from "../models/Partner.model";
import Cypher, { generateRandomString } from "../utils/Cypher";
import { randomUUID } from "crypto";
import ApiKeyService from "./ApiKey.service ";

export default class PartnerService {
    private static createKeys(data: string): { key: string, sec: string } {
        const randomString = generateRandomString(20)
        const apiKey = Cypher.generateAPIKey(data, randomString)
        const sec = randomUUID()

        return {
            key: apiKey,
            sec: sec
        }
    }

    static async addPartner(partner: Omit<IPartner, 'key' | 'sec'>, transaction?: Transaction): Promise<Partner> {
        const { key, sec } = this.createKeys(partner.id)

        const newPartner: Partner = Partner.build({ ...partner, key, sec })
        const result = transaction ? await newPartner.save({ transaction }) : await newPartner.save()

        return result
    }

    static async viewPartners(): Promise<Partner[] | void> {
        const partners: Partner[] = await Partner.findAll()
        return partners
    }

    static async viewSinglePartner(uuid: string): Promise<Partner | null> {
        const partner: Partner | null = await Partner.findByPk(uuid)
        return partner
    }

    static async viewSinglePartnerByEmail(email: string): Promise<Partner | null> {
        const partner: Partner | null = await Partner.findOne({ where: { email } })
        return partner
    }

    static async viewPartnersWithCustomQuery(query: any): Promise<Partner[]> {
        const partners: Partner[] = await Partner.findAll(query)
        return partners
    }

    static async updateProfilePicture(partner: Partner, profilePicture: string): Promise<Partner> {
        await partner.update({ profilePicture })

        // Get updated partner info
        const updatedPartner = await Partner.findByPk(partner.id)
        if (!updatedPartner) {
            throw new Error('Partner not found')
        }
        
        return updatedPartner
    }

    static async generateKeys(partner: Partner): Promise<{ key: string, sec: string }> {
        const { key, sec } = this.createKeys(partner.id)
        await Partner.update({ key, sec }, { where: { id: partner.id } })
        const partnerActiveKey = await ApiKeyService.viewActiveApiKeyByPartnerId(partner.id)
        if (partnerActiveKey) {
            await ApiKeyService.deactivateApiKey(partnerActiveKey)
        }

        await ApiKeyService.addApiKey({
            key,
            partnerId: partner.id,
            active: true,
            id: randomUUID()
        })

        return { key, sec }
    }
}