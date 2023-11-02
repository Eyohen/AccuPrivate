import { Table, Column, Model, DataType , IsUUID, PrimaryKey } from "sequelize-typescript";

@Table
export default class Notification extends Model<Notification> {
    
}

export interface  INotification extends Notification {

}

export interface  ICreateNotification {
    
}

export interface  IUpdateNotification {
    
}