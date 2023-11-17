import express, { Router } from "express";
import PublicRoleController from "../controllers/Public/Role.controller";
import AdminRoleController from "../controllers/Admin/Role.controller";
import { basicAuth } from "../middlewares/Auth";
import { AuthenticatedController } from "../utils/Interface";

const router: Router = express.Router()

router
    .use(basicAuth('access'))

    // Public routes
    .get('/', PublicRoleController.getRoles)
    .get('/info', PublicRoleController.getRoleInfo)

    // Admin routes
    .patch('/', AuthenticatedController(AdminRoleController.updateRole))
    .post('/new', AuthenticatedController(AdminRoleController.createRole))

export default router

