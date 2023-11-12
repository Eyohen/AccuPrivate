import express, { Router } from "express";
import AuthController from "../../controllers/Public/Auth.controller";
import { basicAuth } from "../../middlewares/Auth";

const router: Router = express.Router()

router
    .post('/signup', AuthController.signup)
    .post('/verifyemail', basicAuth('emailverification'), AuthController.verifyEmail)
    .get('/verifyemail', AuthController.resendVerificationEmail)
    .post('/forgotpassword', AuthController.forgotPassword)
    .post('/resetpassword', basicAuth('passwordreset'), AuthController.resetPassword)
    .post('/login', AuthController.login)

export default router

