import express, { Router } from "express";
import PublicAuthController from "../../controllers/Public/Auth.controller";
import AdminAuthController from "../../controllers/Admin/Auth.controller";
import { basicAuth } from "../../middlewares/Auth";

const router: Router = express.Router()

router
    .post('/signup', PublicAuthController.signup)
    .post('/verifyemail', basicAuth('emailverification'), PublicAuthController.verifyEmail)
    .get('/verifyemail', PublicAuthController.resendVerificationEmail)
    .post('/forgotpassword', PublicAuthController.forgotPassword)
    .post('/resetpassword', basicAuth('passwordreset'), PublicAuthController.resetPassword)
    .post('/login', PublicAuthController.login)
    .post('/deactivate', AdminAuthController.deactivatePartner)
    .post('/activate', AdminAuthController.activatePartner)

export default router

