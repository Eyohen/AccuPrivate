import express, { Router } from "express";
import VendorController from "../../controllers/Public/Vendor.controller";
import { validateApiKey } from "../../middlewares/Auth";

const router: Router = express.Router()

router
    .post('/validate/meter', validateApiKey, VendorController.validateMeter)
    .get('/token', validateApiKey, VendorController.requestToken)
    .get('/discos', VendorController.getDiscos)
    .get('/requery-transaction', VendorController.requeryTimedOutTransaction)
    .get('/discos/check', validateApiKey, VendorController.checkDisco)

export default router

