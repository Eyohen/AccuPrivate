import express, { Router } from "express";
import { basicAuth } from "../middlewares/Auth";
import { AuthenticatedController } from "../utils/Interface";
import PartnerProfileController from "../controllers/Public/Partner.controller";

const router: Router = express.Router()

router
    .use(basicAuth('access'))
    .post('/invite', AuthenticatedController(PartnerProfileController.invitePartner)) // TODO: SuperAdmin only
    .get('/info', AuthenticatedController(PartnerProfileController.getPartnerInfo)) // TODO: sUPERaDMIN ONLY

export default router

