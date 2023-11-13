import express, { Router } from "express";
import ApiKeyController from "../../controllers/Public/ApiKey.controller";
import { basicAuth } from "../../middlewares/Auth";

const router: Router = express.Router()

router
    .get('/active', basicAuth('access'), ApiKeyController.getActiveAPIKey)
    .get('/new', basicAuth('access'), ApiKeyController.generateApiKeys)

export default router

