import express, { Router } from "express";
import ApiKeyController from "../controllers/Public/ApiKey.controller";
import { basicAuth } from "../middlewares/Auth";

const router: Router = express.Router()

router
    .use(basicAuth('access'))
    .get('/active', ApiKeyController.getActiveAPIKey)
    .get('/new', ApiKeyController.generateApiKeys)

export default router

