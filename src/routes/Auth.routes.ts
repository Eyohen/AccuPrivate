import express, { Router } from "express";
import PublicAuthController from "../controllers/Public/Auth.controller";
import AdminAuthController from "../controllers/Admin/Auth.controller";
import { basicAuth } from "../middlewares/Auth";
import { AuthenticatedController } from "../utils/Interface";

const router: Router = express.Router()

router
    .post('/signup', PublicAuthController.signup)
    .post('/verifyemail', basicAuth('emailverification'), AuthenticatedController(PublicAuthController.verifyEmail))
    .get('/verifyemail', PublicAuthController.resendVerificationEmail)
    .post('/forgotpassword', PublicAuthController.forgotPassword)
    .post('/resetpassword', basicAuth('passwordreset'), AuthenticatedController(PublicAuthController.resetPassword))
    .post('/changepassword', basicAuth('access'), AuthenticatedController(PublicAuthController.changePassword))
    .post('/login', AuthenticatedController(PublicAuthController.login))
    .post('/deactivate', AuthenticatedController(AdminAuthController.deactivatePartner))
    .post('/activate', AuthenticatedController(AdminAuthController.activatePartner))
    .post('/logout', basicAuth('access'), AuthenticatedController(PublicAuthController.logout))
    .get('/loggeduser', basicAuth('access'), AuthenticatedController(PublicAuthController.getLoggedUserData))

export default router

