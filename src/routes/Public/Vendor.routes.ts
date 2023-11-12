import express, { Router } from "express";
import VendorController from "../../controllers/Public/Vendor.controller";

const router: Router = express.Router()

router
    .post('/validate/meter', VendorController.validateMeter)
    .post('/vend/power', VendorController.requestToken)
    .get('/token', VendorController.requestToken)
    .get('/discos', VendorController.getDiscos)
    .get('/requery-transaction', VendorController.requeryTimedOutTransaction)

export default router

