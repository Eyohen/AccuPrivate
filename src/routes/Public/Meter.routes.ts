import express, { Router } from "express";
import MeterController from "../../controllers/Public/Meter.controller";
import { validateApiKey } from "../../middlewares/Auth";

export const router: Router = express.Router()

router
    .get('/info', MeterController.getMeterInfo)
    .get('/', MeterController.getMeters)

export default router