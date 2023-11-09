import express, { Router } from "express";
import UserController from "../../controllers/Admin/User.controller";

const router: Router = express.Router()

router
    .get('/info', UserController.getUserInfo)
    .get('/', UserController.getUsers)

export default router

