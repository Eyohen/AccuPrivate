import express, { Router } from "express";
import { basicAuth } from "../middlewares/Auth";
import PartnerController from "../controllers/Public/Partner.controller";
import { AuthenticatedController } from "../utils/Interface";

const router: Router = express.Router();

router
    .use(basicAuth('access'))
    .get('/all',AuthenticatedController(PartnerController.getAllPartners))
    .get('/info',AuthenticatedController(PartnerController.getSinglePartner))



export default router 