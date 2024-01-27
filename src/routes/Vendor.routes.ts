import express, { Router } from "express";
import VendorController from "../controllers/Public/Vendor.controller/Vendor.controller";
import { validateApiKey } from "../middlewares/Auth";
import { AuthenticatedController } from "../utils/Interface";
import { AirtimeVendController } from "../controllers/Public/Vendor.controller/Airtime.controller";

const router: Router = express.Router()

router
    .post('/validate/meter', validateApiKey, VendorController.validateMeter)
    .get('/token', validateApiKey, VendorController.requestToken)
    .get('/discos', VendorController.getDiscos)
    .get('/discos/check', VendorController.checkDisco)
    .post('/confirm-payment', validateApiKey, AuthenticatedController(VendorController.confirmPayment))

    .post('/validate/phone', validateApiKey, AirtimeVendController.validateAirtimeRequest)
    .get('/airtime', validateApiKey, AirtimeVendController.requestAirtime)

export default router

