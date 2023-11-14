import express, { Router } from "express";
import ProfileController from "../../controllers/Public/Profile.controller";
import FileUploadService from "../../utils/FileUpload";
import { basicAuth } from "../../middlewares/Auth";

const router: Router = express.Router()

router
    .use(basicAuth('access'))
    .patch('/profilepicture', FileUploadService.multerUpload.single('profile_picture'), ProfileController.updateProfile)

export default router

