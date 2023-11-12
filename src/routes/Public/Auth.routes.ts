import express, { Router } from "express";
import AuthController from "../../controllers/Public/Auth.controller";
import { basicAuth } from "../../middlewares/Auth";

const router: Router = express.Router()

router
    .post('/signup', AuthController.signup)
    .post('/verifyemail', basicAuth('emailverification') ,AuthController.verifyEmail)
    .get('/verifyemail', AuthController.resendVerificationEmail)
    .get('/forgotpassword', AuthController.forgotPassword)
    .get('/resetpassword', AuthController.resetPassword)
    .get('/login', AuthController.login)

export default router

