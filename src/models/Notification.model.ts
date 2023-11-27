import { Table, Column, Model, DataType , IsUUID, PrimaryKey, BelongsTo, HasOne, ForeignKey } from "sequelize-typescript";
import Entity from "./Entity/Entity.model";
import Event from "./Event.model";

@Table
export default class Notification extends Model<INotification | Notification> {
    @IsUUID(4)
    @PrimaryKey
    @Column
    id: string;

    @Column({ type: DataType.STRING, allowNull: false })
    title: string;

    @Column({ type: DataType.TEXT, allowNull: false })
    message: string;

    @Column({ type: DataType.STRING, allowNull: false })
    heading: string;

    @ForeignKey(() => Event)
    @IsUUID(4)
    @Column({ type: DataType.STRING, allowNull: true })
    eventId: string;

    @BelongsTo(() => Event)
    event: Event

    @ForeignKey(() => Entity)
    @IsUUID(4)
    @Column({ type: DataType.STRING, allowNull: false })
    entityId: string;

    @BelongsTo(() => Entity)
    entity: Entity
}

export interface  INotification {
    id: string;
    title: string;
    message: string;
    heading: string;
    eventId?: string;
    entityId: string;
}

export interface  ICreateNotification extends INotification {}

export interface  IUpdateNotification {
    title?: string;
    message?: string;
    heading?: string;
}