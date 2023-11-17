import { NextFunction, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { BadRequestError } from "../../utils/Errors";
import RoleService from "../../services/Role.service";
import { RoleEnum } from "../../models/Role.model";
import { AuthenticatedRequest } from "../../utils/Interface";

export default class RoleController {
    //  Create role
    static async createRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { name, description } = req.body

        const role = await RoleService.addRole({ name, description, id: uuidv4() })

        res.status(200).json({
            status: 'success',
            message: 'Role created successfully',
            data: { role }
        })
    }

    static async updateRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { id, name, description }: { id: string, name: RoleEnum, description: string } = req.body

        const role = await RoleService.viewRoleById(id)
        if (!role) {
            throw new BadRequestError('Role not found')
        }

        // Check if role name is among the default roles
        if (Object.values(RoleEnum).includes(name)) {
            throw new BadRequestError('You cannot update a default role')
        }

        const updatedRole = await RoleService.updateRole(role, { name, description })

        res.status(200).json({
            status: 'success',
            message: 'Role updated successfully',
            data: { role: updatedRole }
        })
    }
}