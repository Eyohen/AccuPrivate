import express, { Router } from "express";
import TransactionController from "../controllers/Public/Transaction.controller";
import { basicAuth, validateApiKey } from "../middlewares/Auth";
import { AuthenticatedController } from "../utils/Interface";
const newrelic = require('newrelic');

export const router: Router = express.Router()

router
    .use(basicAuth('access'))
    .get('/info', AuthenticatedController(TransactionController.getTransactionInfo))
    .get('/', AuthenticatedController(TransactionController.getTransactions))
    .get('/yesterday', AuthenticatedController(TransactionController.getYesterdaysTransactions))
    .get('/requery-transaction', AuthenticatedController(TransactionController.requeryTimedOutTransaction))

export default router

