// Import required modules, types, and models
import Transaction from "../models/Transaction.model";
import { ITransaction, ICreateTransaction, IUpdateTransaction } from "../models/Transaction.model";
import EventService from "./Event.service";
import { v4 as uuidv4 } from 'uuid';
import { Status } from '../models/Event.model';

// Define the TransactionService class for handling transaction-related operations
export default class TransactionService {

    // Create an instance of EventService for handling events
    private static eventService: EventService = new EventService();

    // Static method for adding a new transaction
    static async addTransaction(transaction: ICreateTransaction): Promise<Transaction | Error> {
        try {
            // Build a new transaction object
            const newTransaction: Transaction = await Transaction.build(transaction);
            // Save the new transaction to the database
            newTransaction.save();
            return newTransaction;
        } catch (error) {
            throw new Error()
        }
    }

    // Static method for viewing all transactions
    static async veiwTransactions(): Promise<Transaction[] | Error> {
        try {
            // Retrieve all transactions from the database
            const transactions: Transaction[] = await Transaction.findAll();
            return transactions;
        } catch (err) {
            throw new Error()
        }
    }

    // Static method for viewing a single transaction by UUID
    static async veiwSingleTransaction(uuid: string): Promise<Transaction | Error > {
        try {
            // Retrieve a single transaction by its UUID
            const transaction: Transaction | null = await Transaction.findByPk(uuid);
            if (transaction == null){
                throw new Error()
            }
            return transaction;
        } catch (err) {
            throw new Error()
        }
    }

    // Static method for updating a single transaction by UUID
    static async updateSingleTransaction(uuid: string, updateTransaction: IUpdateTransaction): Promise<Transaction | Error> {
        try {
            
            // Update the transaction in the database
            const updateResult: [number] = await Transaction.update(updateTransaction, { where: { id: uuid } });
            console.log('this is the uuid',uuid)
            // Retrieve the updated transaction by its UUID
            const updatedTransaction: Transaction | null = await Transaction.findByPk(uuid);
            if (updatedTransaction == null){
                throw new Error()
            }
            return updatedTransaction;
        } catch (error) {
            throw new Error()
        }
    }
}
