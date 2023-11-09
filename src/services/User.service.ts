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