import express, { Router } from "express";
import TransactionController from "../../controllers/Public/Transaction.controller";

export const router: Router = express.Router()

router
    .get('/info', TransactionController.getTransactionInfo)
    .get('/', TransactionController.getTransactions)

export default router