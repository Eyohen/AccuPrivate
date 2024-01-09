import express, { Router } from "express";
import { basicAuth } from "../middlewares/Auth";
import { AuthenticatedController } from "../utils/Interface";
import TeamMemberProfileController from "../controllers/Public/TeamMember.controller";

const router: Router = express.Router()

router
    .use(basicAuth('access'))
    .post('/member/new', AuthenticatedController(TeamMemberProfileController.inviteTeamMember))
    .get('/member/', AuthenticatedController(TeamMemberProfileController.getTeamMembers))
    .get('/member/info', AuthenticatedController(TeamMemberProfileController.getTeamMemberInfo))
    .delete('/member', AuthenticatedController(TeamMemberProfileController.deleteTeamMember))

export default router

