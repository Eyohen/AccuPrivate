import { Transaction } from "sequelize";
import Password, { IPassword } from "../models/Password.model";
import Cypher from "../utils/Cypher";
import Partner from "../models/Partner.model";

export default class PasswordService{
    static async addPassword(password: IPassword, transaction?: Transaction): Promise<Password> {
        password.password = Cypher.hashPassword(password.password)
        const newPassword: Password = Password.build(password)
        const result = transaction ? await newPassword.save({ transaction }) : await newPassword.save()

        return result
    }

    static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        const result = await Cypher.comparePassword(password, hashedPassword)
        return result
    }
    
    static async viewPasswords(): Promise<Password[] | void> {
        const passwords: Password[] = await Password.findAll()
        return passwords
    }

    static async viewSinglePassword(uuid: string): Promise<Password | null> {
        const password: Password | null = await Password.findByPk(uuid)
        return password
    }

    static async updatePassword(partnerId: string, newPassword: string) {
        return await Password.updatePassword(partnerId, newPassword)
    }

    static async viewSinglePasswordByPartnerId(partnerId: string): Promise<Password | null> {
        const password: Password | null = await Password.findOne({ where: { partnerId } })
        return password
    }

    static async viewPasswordsWithCustomQuery(query: any): Promise<Password[]> {
        const Passwords: Password[] = await Password.findAll(query)
        return Passwords
    }
}