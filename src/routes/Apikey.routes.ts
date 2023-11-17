import express, { Router } from "express";
import ApiKeyController from "../controllers/Public/ApiKey.controller";
import { basicAuth } from "../middlewares/Auth";
import { AuthenticatedController } from "../utils/Interface";

const router: Router = express.Router()

router
    .use(basicAuth('access'))
    .get('/active', AuthenticatedController(ApiKeyController.getActiveAPIKey))
    .get('/new', AuthenticatedController(ApiKeyController.generateApiKeys))

export default router

