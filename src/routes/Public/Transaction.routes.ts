import express, { Router } from "express";
import TransactionController from "../../controllers/Public/Transaction.controller";
import { validateApiKey } from "../../middlewares/Auth";

export const router: Router = express.Router()

router
    .get('/info', validateApiKey, TransactionController.getTransactionInfo)
    .get('/', validateApiKey, TransactionController.getTransactions)

export default router