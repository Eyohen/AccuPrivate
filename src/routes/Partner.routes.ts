import express, { Router } from "express";
import { basicAuth } from "../middlewares/Auth";
import PartnerController from "../controllers/Public/Partner.controller";
import { AuthenticatedController } from "../utils/Interface";

const router: Router = express.Router();

router
    .use(basicAuth('access'))
    .get('/info', AuthenticatedController(PartnerController.getPartnerInfo))
    .post('/invite', AuthenticatedController(PartnerController.invitePartner))

export default router 
