import express, { Router } from "express";
import MeterController from "../../controllers/Public/Meter.controller";

export const router: Router = express.Router()

router
    .get('/info', MeterController.getMeterInfo)
    .get('/', MeterController.getMeters)

export default router