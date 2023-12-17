import express, { Router } from "express";
import VendorController from "../controllers/Public/Vendor.controller";
import { validateApiKey } from "../middlewares/Auth";
import { AuthenticatedController } from "../utils/Interface";
const newrelic = require('newrelic');

const router: Router = express.Router()

router
    .post('/validate/meter', validateApiKey, VendorController.validateMeter)
    .get('/token', validateApiKey, VendorController.requestToken)
    .get('/discos', VendorController.getDiscos)
    .get('/discos/check', VendorController.checkDisco)
    .post('/confirm-payment', validateApiKey, AuthenticatedController(VendorController.confirmPayment))

export default router

