// Import required modules, types, and models
import Transaction from "../models/Transaction.model";
import { ITransaction, ICreateTransaction, IUpdateTransaction } from "../models/Transaction.model";
import EventService from "./Event.service";
import { v4 as uuidv4 } from 'uuid';
import { Status } from '../models/Event.model';
import logger from "../utils/Logger";

// Define the TransactionService class for handling transaction-related operations
export default class TransactionService {
    // Create an instance of EventService for handling events
    private static eventService: EventService = new EventService();

    // Static method for adding a new transaction
    static async addTransaction(transaction: ICreateTransaction): Promise<Transaction | Error> {
        // Build a new transaction object
        const newTransaction: Transaction = await Transaction.build(transaction);
        // Save the new transaction to the database
        newTransaction.save();
        return newTransaction;
    }

    // Static method for viewing all transactions
    static async veiwTransactions(): Promise<Transaction[] | Error> {
        // Retrieve all transactions from the database
        const transactions: Transaction[] = await Transaction.findAll();
        return transactions;
    }

    // Static method for viewing a single transaction by UUID
    static async veiwSingleTransaction(uuid: string): Promise<Transaction | Error> {
        // Retrieve a single transaction by its UUID
        const transaction: Transaction | null = await Transaction.findByPk(uuid);
        if (transaction == null) {
            throw new Error()
        }
        return transaction;
    }

    // Static method for updating a single transaction by UUID
    static async updateSingleTransaction(uuid: string, updateTransaction: IUpdateTransaction): Promise<Transaction | Error> {
        // Update the transaction in the database
        const updateResult: [number] = await Transaction.update(updateTransaction, { where: { id: uuid } });
        logger.info('this is the uuid', uuid)
        // Retrieve the updated transaction by its UUID
        const updatedTransaction: Transaction | null = await Transaction.findByPk(uuid);
        if (updatedTransaction == null) {
            throw new Error()
        }
        return updatedTransaction;
    }
}
