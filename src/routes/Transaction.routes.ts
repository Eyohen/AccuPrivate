import express, { Router } from "express";
import TransactionController from "../controllers/Public/Transaction.controller";
import { basicAuth, validateApiKey } from "../middlewares/Auth";

export const router: Router = express.Router()

router
    .use(basicAuth('access'))
    .get('/info', TransactionController.getTransactionInfo)
    .get('/', TransactionController.getTransactions)
    .get('/yesterday', TransactionController.getYesterdaysTransactions)
    .get('/requery-transaction', TransactionController.requeryTimedOutTransaction)

export default router