import express, { Router } from "express";
import PowerUnitController from "../../controllers/Public/Powerunit.controller";

const router: Router = express.Router()

router
    .get('/info', PowerUnitController.getPowerUnitInfo)
    .get('/', PowerUnitController.getPowerUnits)

export default router

