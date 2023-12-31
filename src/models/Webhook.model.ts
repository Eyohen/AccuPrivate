// Import necessary modules and dependencies
import { Table, Column, Model, DataType, IsUUID, PrimaryKey, BelongsTo, ForeignKey } from "sequelize-typescript";
import PartnerProfile from "./Entity/Profiles/PartnerProfile.model";

// Define the "Partner" table model
@Table
export default class WebHook extends Model<WebHook | IWebHook> {
    // Define a primary key field with a UUID (Universally Unique Identifier) as its type
    @IsUUID(4)
    @PrimaryKey
    @Column
    id: string;

    @Column({ type: DataType.STRING, allowNull: true })
    url: string;

    @IsUUID(4)
    @ForeignKey(() => PartnerProfile)
    @Column({ type: DataType.STRING, allowNull: false })
    partnerId: string;

    // Define a column for the Partner's email (string type, not nullable)
    @BelongsTo(() => PartnerProfile)
    partner: PartnerProfile;
}


// Interface representing the structure of a Partner entity
export interface IWebHook {
    id: string;              // Unique identifier for the Partner
    url?: string;
    partnerId: string;
}

export type IUpdateWebHook = {
    url: string;
}