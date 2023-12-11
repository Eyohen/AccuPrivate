import Role, { IRole, IUpdateRole } from "../models/Role.model";

export default class RoleService {
    static async viewAllRoles(): Promise<Role[]> {
        const roles: Role[] = await Role.findAll();
        return roles;
    }

    static async viewRoleByName( name: IRole['name']): Promise<Role | null> {
        const role: Role | null = await Role.findOne({ where: { name } });

        if (!role) {
            throw new Error('Role not found');
        }

        return role;
    }

    static async viewRoleById(id: string): Promise<Role | null> {
        const role: Role | null = await Role.findByPk(id);

        if (!role) {
            throw new Error('Role not found');
        }

        return role;
    }

    static async addRole(roleData: IRole): Promise<Role> {
        const role: Role = Role.build(roleData);
        await role.save();

        return role;
    }

    static async updateRole(role: Role, dataToUpdate: IUpdateRole): Promise<Role> {
        await role.update(dataToUpdate);

        const updatedRole = await Role.findOne({ where: { id: role.id } });
        if (!updatedRole) {
            throw new Error('Role not found');
        }

        return updatedRole;
    }
}
