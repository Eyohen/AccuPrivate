import express, { Router } from "express";
import UserController from "../../controllers/Admin/User.controller";
import { basicAuth } from "../../middlewares/Auth";

const router: Router = express.Router()

router
    .use(basicAuth('access'))
    .get('/info', UserController.getUserInfo)
    .get('/', UserController.getUsers)

export default router

