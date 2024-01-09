import { randomUUID } from "crypto";
import { Database } from "../models";
import Entity from "../models/Entity/Entity.model";
import Transaction from "../models/Transaction.model";
import User from "../models/User.model";
import { IUser, ICreateUser } from "../models/User.model";
import EntityService from "./Entity/Entity.service";
import { RoleEnum } from "../models/Role.model";
import PasswordService from "./Password.service";
import { UUIDV4 } from "sequelize";
export default class UserService {

    static async addUserIfNotExists(user: IUser): Promise<User> {
        const transaction = await Database.transaction()

        const existingUser: User | null = await User.findOne({ where: { email: user.email, phoneNumber: user.phoneNumber } })
        if (existingUser) {
            return existingUser
        }
        const newUser: User = User.build(user)
        await newUser.save({ transaction })

        const entity = await EntityService.addEntity({
            email: user.email,
            userId: newUser.id,
            id: randomUUID(),
            role: RoleEnum.EndUser,
            status: {
                emailVerified: true,
                activated: true,
            },
            requireOTPOnLogin: true
        }, transaction)

        const password = await PasswordService.addPassword({
            id: randomUUID(),
            entityId: entity.id,
            password: randomUUID()
        }, transaction)

        await transaction.commit()

        return newUser
    }

    static async addUser(user: ICreateUser): Promise<User> {
        try {
            const newUser: User = User.build(user)
            await newUser.save()
            return newUser
        } catch (error) {
            console.error(error)
            throw new Error()
        }
    }

    static async viewSingleUserWithEmail(email: string): Promise<User | null> {
        const user: User | null = await User.findOne({ where: { email } })
        return user
    }

    static async viewUsers(): Promise<User[]> {
        const Users: User[] = await User.findAll()
        return Users
    }

    static async viewSingleUser(uuid: string): Promise<User | null> {
        const user: User | null = await User.findByPk(uuid)
        return user
    }

    static async updateSingleUser() {

    }





}