import express, { Router } from "express";
import AuthController from "../../controllers/Public/Auth.controller";

const router: Router = express.Router()

router
    .post('/signup', AuthController.signup)
    .post('/verifyemail', AuthController.verifyEmail)
    .get('/verifyemail', AuthController.resendVerificationEmail)
    .get('/forgotpassword', AuthController.forgotPassword)
    .get('/resetpassword', AuthController.resetPassword)
    .get('/login', AuthController.login)

export default router

