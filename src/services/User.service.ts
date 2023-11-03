import Transaction from "../models/Transaction.model";
import User from "../models/User.model";
import { IUser, ICreateUser } from "../models/User.model";
export default class UserService {


    static async addUser(user: ICreateUser, transaction?: Transaction | Error, TransactionId?: string,): Promise<User | Error> {
        try {
            const newUser: User = User.build(user)
            await newUser.save()
            if (transaction && transaction instanceof Transaction) newUser.$add('transaction', transaction)
            return newUser
        } catch (error) {
            throw new Error()
        }
    }


    static async veiwUsers(): Promise<User[] | Error> {
        try {
            const Users: User[] = await User.findAll()
            return Users
        } catch (err) {
            throw new Error()
        }
    }

    static async veiwSingleUser(uuid: string): Promise<User | Error | null> {
        try {
            const user: User | null = await User.findByPk(uuid)
            return user
        } catch (error) {
            throw new Error()
        }
    }

    static async updateSingleUser() {

    }





}