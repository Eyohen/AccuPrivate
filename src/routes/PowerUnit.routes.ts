import express, { Router } from "express";
import PowerUnitController from "../controllers/Public/Powerunit.controller";
import { basicAuth } from "../middlewares/Auth";
import { AuthenticatedController } from "../utils/Interface";

const router: Router = express.Router()

router
    .use(basicAuth('access'))
    .get('/info', AuthenticatedController(PowerUnitController.getPowerUnitInfo))
    .get('/', AuthenticatedController(PowerUnitController.getPowerUnits))

export default router

