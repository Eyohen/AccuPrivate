// Import necessary modules and dependencies
import { Table, Column, Model, DataType, IsUUID, PrimaryKey, HasMany, HasOne, BelongsTo, ForeignKey } from "sequelize-typescript";
import Transaction from "./Transaction.model";
import Partner from "./Entity/Profiles/PartnerProfile.model";
import Cypher from "../utils/Cypher";
import Entity from "./Entity/Entity.model";

// Define the "Partner" table model
@Table
export default class Password extends Model<Password | IPassword> {
    // Define a primary key field with a UUID (Universally Unique Identifier) as its type
    @IsUUID(4)
    @PrimaryKey
    @Column
    id: string;

    @Column({ type: DataType.STRING, allowNull: false })
    password: string;

    @IsUUID(4)
    @ForeignKey(() => Entity)
    @Column
    entityId: string;

    // Define a column for the Partner's email (string type, not nullable)
    @BelongsTo(() => Entity)
    entity: Entity;

    static updatePassword = async (partnerId: string, newPassword: string) => {
        const password = await Password.findOne({
            where: {
                partnerId
            }
        });

        if (!password) throw new Error('Password not found');

        password.password = Cypher.hashPassword(newPassword);
        await password.save();

        return password;
    }
}


// Interface representing the structure of a Partner entity
export interface IPassword {
    id: string;              // Unique identifier for the Partner
    password: string;   // Phone number for contacting the Partner
    partnerId: string;
}
