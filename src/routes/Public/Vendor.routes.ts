import express, { Router } from "express";
import VendorController from "../../controllers/Public/Vendor.controller";

export const router: Router = express.Router()

router.post('/validate/meter', VendorController.validateMeter)
router.post('/vend/power', VendorController.requestToken)
router.post('/complete/transaction', VendorController.completeTransaction)
router.get('/token', VendorController.requestToken)

