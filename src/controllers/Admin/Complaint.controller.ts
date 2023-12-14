import { NextFunction , Response , Request } from "express";
import { AuthenticatedRequest } from "../../utils/Interface";
import EntityService from "../../services/Entity/Entity.service";
import fs from 'fs'
import FileUploadService from "../../utils/FileUpload";
import { Status } from "../../models/Complaint.model";
import { InternalServerError , BadRequestError } from "../../utils/Errors";
import Complaint from "../../models/Complaint.model";
import ComplaintService from "../../services/Complaint.service";

export class ComplaintController {

    static async getComplaint(req: AuthenticatedRequest , res : Response , next : NextFunction) {
        const {id} = req.params
        try{
            const complaint = await ComplaintService.viewSingleComplaint(id);
            res.status(200).json({
                status: 'success',
                data: {
                    complaint
                },  
            })
        }catch(err){
            next(new InternalServerError('Sorry Couldn\'t get complaint'))
        }
    }

    static async getComplaints(req: AuthenticatedRequest , res : Response , next : NextFunction){
        const {entityId , page, size , status } = req.query;
        const limit = parseInt(size as string) || null;
        const offset = parseInt (page as string) || null;
        const _entityId = entityId as string
        const _status = status as string
        try{
            const complaints = await ComplaintService.viewAllComplainsPaginatedFiltered(
                limit, 
                offset, 
                _entityId,
                _status
            );
            res.status(200).json({
                status: 'success',
                data: complaints,
            })
        }catch(err){
            console.log(err)
            next(new InternalServerError('Sorry Couldn\'t get complaint'))
        }
    }

    // static async getAllComplaints(){

    // }

    static async createComplaint(req: AuthenticatedRequest , res : Response , next : NextFunction){
        const entityId = req?.user?.user?.entity.id || req.body.entityId

        const {
            message,
            category,
            title,
        }:{
            message: string | null,
            category: string | null,
            title: string | null,
        } = req.body

        

        if (!message) {
            return next(new BadRequestError('No message  provided'))
        }

        if (!title) {
            return next(new BadRequestError('No title provided'))
        }

        if (!category) {
            return next(new BadRequestError('No category  provided'))
        }

        const  entity = await EntityService.viewSingleEntity(entityId)

        if (!entity) {
            return next(new InternalServerError('Authenticated Entity not found'))
        }

        const imageFile = req.file
        let secureUrl = ''
        if (imageFile) {
            secureUrl = await FileUploadService.uploadComplainPicture({
                filePath: imageFile.path,
            })
    
            fs.unlinkSync(imageFile.path)
        }

        

        try{
            const complaint: Complaint | void = await ComplaintService.addComplaint({
                category,
                message,
                image: secureUrl || '',
                status: Status.PENDING, 
                entityId,
                title
            }) 
            res.status(200).json({
                status: 'success',
                data: {
                    complaint
                },
               
            })
        }catch(err){
            next(new InternalServerError('Sorry Couldn\'t create complaint'))
        }
        

    }
}