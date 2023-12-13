import Complaint, { ICreateComplaint } from "../models/Complaint.model";
import Entity from "../models/Entity/Entity.model";
import logger from "../utils/Logger";
import { v4 as uuidv4 } from 'uuid';

export default class ComplaintService {
  static async addComplaint(
    complaint: ICreateComplaint
  ): Promise<Complaint | void> {
    try {
        console.log(complaint)
      const newComplaint: Complaint = await Complaint.build({
        id: uuidv4(),
        ...complaint
        });
      await newComplaint.save();
      return newComplaint;
    } catch (err) {
      logger.error("Error Logging Event");
      throw err
    }
  }

  static async viewSingleComplaint(
    uuid: string
  ): Promise<Complaint | void | null> {
    try {
      const complaint: Complaint | null = await Complaint.findOne({
        where: { id: uuid },
        include: [Entity],
      });
      return complaint;
    } catch (err) {
      logger.error("Error Reading Complaint");
    }
  }

  static async viewAllComplainsPaginatedFiltered(
    limit: number | null,
    offset: number | null,
    entityId: string | null,
    status: string | null,
  ): Promise<{
    complaint: Complaint[];
    pagination?: {
      currentPage?: number;
      totalPages?: number;
      totalItems?: number;
      pageSize?: number;
    };
  } | void | null> {
    let _limit = 9;
    let _offset = 1;
    // const where: { entityId?: string } = {};
    const findAllObject: { where? : { entityId?: string , status?: string } , limt: number , offset: number} | any =  {}
    if (limit) findAllObject.limt = limit;
    if (offset) findAllObject.offset = offset - 1;
    if(entityId || status ) findAllObject.where = {}
    if (entityId) findAllObject.where.entityId = entityId;
    if(status) findAllObject.where.status = status
    console.log(findAllObject)
    
    try {
      const complaints: Complaint[] | null = await Complaint.findAll(findAllObject);
      const totalItems = await Complaint.count({ where : findAllObject.where });
      const totalPages = Math.ceil(totalItems / _limit);
      return {
        complaint : complaints,
        pagination: {
            currentPage : _offset,
            pageSize : _limit,
            totalItems,
            totalPages
        }
      };
    } catch (err) {
        console.log(err)
      logger.error("Error Reading Complaints");
    }
  }
}
