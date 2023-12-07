// Import required modules, types, and models
import Transaction from "../models/Transaction.model";
import { ITransaction, ICreateTransaction, IUpdateTransaction } from "../models/Transaction.model";
import EventService from "./Event.service";
import { v4 as uuidv4 } from 'uuid';
import Event, { Status } from '../models/Event.model';
import logger from "../utils/Logger";
import PowerUnit from "../models/PowerUnit.model";
import Partner from "../models/Entity/Profiles/PartnerProfile.model";
import User from "../models/User.model";
import Meter from "../models/Meter.model";
import { Op } from "sequelize";

// Define the TransactionService class for handling transaction-related operations
export default class TransactionService {
    // Create an instance of EventService for handling events
    private static eventService: EventService = new EventService();

    // Static method for adding a new transaction
    static async addTransaction(transaction: ICreateTransaction): Promise<Transaction> {
        // Build a new transaction object
        const newTransaction: Transaction = Transaction.build(transaction);
        // Save the new tran    saction to the database
        const yesterdayDate = new Date()
        yesterdayDate.setDate(yesterdayDate.getDate() - 1)
        newTransaction.transactionTimestamp = yesterdayDate

        await newTransaction.save();
        return newTransaction;
    }

    // Static method for viewing all transactions
    static async viewTransactions(): Promise<Transaction[] | Error> {
        // Retrieve all transactions from the database
        const transactions: Transaction[] = await Transaction.findAll();
        return transactions;
    }

    static async viewTransactionsWithCustomQuery(query: any): Promise<Transaction[]> {
        // Retrieve all transactions from the database
        // Sort from latest 
        const transactions: Transaction[] = (await Transaction.findAll({ ...query, include: [PowerUnit, Event, Partner, User, Meter] })).sort((a, b) => { return b.transactionTimestamp.getTime() - a.transactionTimestamp.getTime() });
        return transactions;
    }

    // Static method for viewing a single transaction by UUID
    static async viewSingleTransaction(uuid: string): Promise<Transaction | null> {
        // Retrieve a single transaction by its UUID
        const transaction: Transaction | null = await Transaction.findByPk(uuid, { include: [PowerUnit, Event, Partner, User, Meter] });
        return transaction;
    }

    static async viewSingleTransactionByBankRefID(bankRefId: string): Promise<Transaction | null> {
        // Retrieve a single transaction by its UUID
        const transaction: Transaction | null = await Transaction.findOne({ where: { bankRefId: bankRefId }, include: [Partner, Meter, User] },);
        return transaction;
    }

    // Static method for updating a single transaction by UUID
    static async updateSingleTransaction(uuid: string, updateTransaction: IUpdateTransaction): Promise<Transaction | null> {
        // Update the transaction in the database
        const updateResult: [number] = await Transaction.update(updateTransaction, { where: { id: uuid } });
        // Retrieve the updated transaction by its UUID
        const updatedTransaction: Transaction | null = await Transaction.findByPk(uuid);
        return updatedTransaction;
    }

    static async viewTransactionForYesterday(partnerId: string): Promise<Transaction[]> {
        const yesterdayDate = new Date()
        yesterdayDate.setDate(yesterdayDate.getDate() - 5)
        const currentDate = new Date()
        console.log(yesterdayDate)
        console.log(new Date())
        console.log(partnerId)
        const transactions: Transaction[] = await Transaction.findAll({
            where: {
                // partnerId: partnerId,
                transactionTimestamp: {
                    [Op.between]: [yesterdayDate, currentDate]
                }
            }
        })
        // console.log(transactions)

        return transactions
    }

    static async viewTransactionsForYesterdayByStatus(partnerId: string, status: 'COMPLETED' | 'PENDING' | 'FAILED'): Promise<Transaction[]> {
        const yesterdayDate = new Date()
        yesterdayDate.setDate(yesterdayDate.getDate() - 1)

        const transactions: Transaction[] = await Transaction.findAll({
            where: {
                partnerId: partnerId,
                status,
                transactionTimestamp: {
                    $between: [yesterdayDate, new Date()]
                }
            }
        })

        return transactions
    }
}
