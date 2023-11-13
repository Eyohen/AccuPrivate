import { Transaction } from "sequelize";
import Partner, { IPartner } from "../models/Partner.model";
import Cypher, { generateRandomString } from "../utils/Cypher";
import { randomUUID } from "crypto";

export default class PartnerService {
    private static createKeys(): { key: string, sec: string } {
        const randomString = generateRandomString(20)
        const apiKey = Cypher.encryptString(randomString)
        const sec = randomUUID()

        console.log({
            key: apiKey,
            sec: sec,
            randomString
        })
        return {
            key: apiKey,
            sec: sec
        }
    }

    static async addPartner(partner: Omit<IPartner, 'key' | 'sec'>, transaction?: Transaction): Promise<Partner> {
        const { key, sec } = this.createKeys()

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

    static async generateKeys(partner: Partner): Promise<{ key: string, sec: string }> {
        const { key, sec } = this.createKeys()
        await Partner.update({ key, sec }, { where: { id: partner.id } })

        return { key, sec }
    }
}