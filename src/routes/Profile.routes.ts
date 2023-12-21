import express, { Router } from "express";
import ProfileController from "../controllers/Public/Profile.controller";
import FileUploadService from "../utils/FileUpload";
import { basicAuth } from "../middlewares/Auth";
import { AuthenticatedController } from "../utils/Interface";

const router: Router = express.Router()

router
    .use(basicAuth('access'))
    .patch(
        '/profilepicture',
        FileUploadService.multerUpload.single('profile_picture'),
        AuthenticatedController(ProfileController.updateProfile)
    )
    .patch(
        '/email',
        AuthenticatedController(ProfileController.updateProfileData)
    )
    .patch(
        '/data',
        AuthenticatedController(ProfileController.updateProfileData)
    )

export default router

