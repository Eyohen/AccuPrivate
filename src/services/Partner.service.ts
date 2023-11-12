import { Transaction } from "sequelize";
import Partner, { IPartner } from "../models/Partner.model";
import Cypher from "../utils/Cypher";

export default class PartnerService{
    static async addPartner(partner: IPartner, transaction?: Transaction): Promise<Partner> {
        const newPartner: Partner = Partner.build(partner)
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
}