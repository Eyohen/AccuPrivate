import express, { Router } from "express";
import UserController from "../controllers/Admin/User.controller";
import { basicAuth } from "../middlewares/Auth";
import { AuthenticatedController } from "../utils/Interface";

const router: Router = express.Router()

router
    .use(basicAuth('access'))
    .get('/info', AuthenticatedController(UserController.getUserInfo))
    .get('/', AuthenticatedController(UserController.getUsers))

export default router

