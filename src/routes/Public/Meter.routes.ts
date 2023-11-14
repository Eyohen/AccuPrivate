import express, { Router } from "express";
import MeterController from "../../controllers/Public/Meter.controller";
import { validateApiKey } from "../../middlewares/Auth";

export const router: Router = express.Router()

router
    .get('/info', validateApiKey, MeterController.getMeterInfo)
    .get('/', validateApiKey, MeterController.getMeters)

export default router