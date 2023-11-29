import express, { Router } from "express";
import MeterController from "../controllers/Public/Meter.controller";
import { validateApiKey } from "../middlewares/Auth";
import { AuthenticatedController } from "../utils/Interface";
import EventController from "../controllers/Admin/Event.controller";

export const router: Router = express.Router()

router
    .get('/info', AuthenticatedController(EventController.getEventInfo))
    .get('/', AuthenticatedController(EventController.getEvents))

export default router