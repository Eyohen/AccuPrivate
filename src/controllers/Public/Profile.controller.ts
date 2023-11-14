import { NextFunction, Request, Response } from "express";
import { BadRequestError, InternalServerError } from "../../utils/Errors";
import PartnerService from "../../services/Partner.service";
import FileUploadService from "../../utils/FileUpload";
import fs from 'fs'

export default class ProfileController {

    static async updateProfile(req: Request, res: Response, next: NextFunction) {
        const { partner } = (req as any).user

        const imageFile = req.file
        if (!imageFile) {
            return next(new BadRequestError('No image file provided'))
        }

        const partner_ = await PartnerService.viewSinglePartnerByEmail(partner.email)
        if (!partner_) {
            return next(new InternalServerError('Authenticated Partner not found'))
        }

        const secureUrl = await FileUploadService.uploadProfilePicture({
            filePath: imageFile.path,
            partner: partner_
        })

        fs.unlinkSync(imageFile.path)
        await partner_.update({ profilePicture: secureUrl })

        res.status(200).json({
            status: 'success',
            message: 'Partner profile updated successfully',
            data: {
                imageLink: secureUrl
            }
        })
    }
}