import express, { Router } from "express";
import PowerUnitController from "../controllers/Public/Powerunit.controller";
import { basicAuth } from "../middlewares/Auth";

const router: Router = express.Router()

router
    .use(basicAuth('access'))
    .get('/info', PowerUnitController.getPowerUnitInfo)
    .get('/', PowerUnitController.getPowerUnits)

export default router

