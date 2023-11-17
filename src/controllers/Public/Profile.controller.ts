import { NextFunction, Request, Response } from "express";
import { BadRequestError, InternalServerError } from "../../utils/Errors";
import PartnerService from "../../services/Entity/Profiles/PartnerProfile.service";
import FileUploadService from "../../utils/FileUpload";
import fs from 'fs'
import { AuthenticatedRequest } from "../../utils/Interface";
import EntityService from "../../services/Entity/Entity.service";

export default class ProfileController {

    static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { entity: { id } } = req.user.user

        const entity = await EntityService.viewSingleEntity(id)
        if (!entity) {
            return next(new InternalServerError('Authenticated Entity not found'))
        }

        const imageFile = req.file
        if (!imageFile) {
            return next(new BadRequestError('No image file provided'))
        }

        const profile = EntityService.getAssociatedProfile(entity)
        if (!profile) {
            return next(new InternalServerError('Authenticated entity profile not found'))
        }

        const secureUrl = await FileUploadService.uploadProfilePicture({
            filePath: imageFile.path,
            entity
        })

        fs.unlinkSync(imageFile.path)
        await entity.update({ profilePicture: secureUrl })

        res.status(200).json({
            status: 'success',
            message: 'Partner profile updated successfully',
            data: {
                imageLink: secureUrl
            }
        })
    }
    
    static async updateProfileDAta(req: Request, res: Response, next: NextFunction) {
        const { partner } = (req as any).user
        const { email } = req.body

        const partner_ = await PartnerService.viewSinglePartnerByEmail(partner.email)
        if (!partner_) {
            return next(new InternalServerError('Authenticated Partner not found'))
        }
        await partner_.update({ email })

        res.status(200).json({
            status: 'success',
            message: 'Partner profile updated successfully',
            data: null
        })
    }
}