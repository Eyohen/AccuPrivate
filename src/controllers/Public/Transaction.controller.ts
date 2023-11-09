import { Request, Response } from "express";
import Transaction, { ITransaction } from "../../models/Transaction.model";
import TransactionService from "../../services/Transaction.service";
import { NotFoundError } from "../../utils/Errors";
import { Status } from "../../models/Event.model";

interface getTransactionInfoRequestBody {
    bankRefId: string
}

interface getTransactionsRequestBody extends ITransaction {
    page: `${number}`
    limit: `${number}`
    status: Status
    startDate: Date
    endDate: Date
    userId: string
    meterId: string
    disco: string
    superagent: 'BUYPOWERNG' | 'BAXI'
}

export default class TransactionController {
    static async getTransactionInfo(req: Request, res: Response) {
        const { bankRefId } = req.query as Record<string, string>

        const transaction: Transaction | null = await TransactionService.viewSingleTransactionByBankRefID(bankRefId)
        if (!transaction) {
            throw new NotFoundError('Transaction not found')
        }

        const powerUnit = await transaction.$get('powerUnit')

        res.status(200).json({
            status: 'success',
            message: 'Transaction info retrieved successfully',
            data: { transaction: { ...transaction.dataValues, powerUnit } }
        })
    }

    static async getTransactions(req: Request, res: Response) {
        const {
            page, limit, status, startDate, endDate,
            userId, disco, superagent
        } = req.query as any as getTransactionsRequestBody

        const query = { where: {} } as any
        if (status) query.where.status = status
        if (startDate && endDate) query.where.transactionTimestamp = { $between: [startDate, endDate] }
        if (userId) query.where.userId = userId
        if (disco) query.where.disco = disco
        if (superagent) query.where.superagent = superagent
        if (limit) query.limit = limit
        if (page && page != '0' && limit) {
            query.offset = Math.abs(parseInt(page) - 1) * parseInt(limit)
        }

        const transactions: Transaction[] = await TransactionService.viewTransactionsWithCustomQuery(query)
        if (!transactions) {
            throw new NotFoundError('Transactions not found')
        }

        res.status(200).json({
            status: 'success',
            message: 'Transactions retrieved successfully',
            data: { transactions }
        })
    }
}