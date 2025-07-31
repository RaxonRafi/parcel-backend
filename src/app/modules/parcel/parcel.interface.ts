import { Types } from "mongoose";

export enum Status {
    REQUESTED = 'REQUESTED',
    APPROVED = 'APPROVED', 
    DISPATCHED = 'DISPATCHED',
    IN_TRANSIT = 'IN_TRANSIT',
    DELIVERED = 'DELIVERED',
    CANCELED = 'CANCELED',
    BLOCKED = 'BLOCKED'
}

export interface IStatuslog {
    trackingId: string,
    status: Status,
    location?: string,
    note?: string,
    updatedBy: Types.ObjectId,
    timestamp?: Date,
}
export interface IAddress {
    street: string,
    city: string,
    state: string,
    zipCode: string,
    country: string
}
export enum Priority {
    LOW = 'LOW',
    NORMAL = 'NORMAL',
    HIGH = 'HIGH',
    URGENT = 'URGENT'
}
export enum ParcelType {
    DOCUMENT = 'DOCUMENT',
    PACKAGE = 'PACKAGE',
    FRAGILE = 'FRAGILE',
    PERISHABLE = 'PERISHABLE'
}
export enum WeightUnit  {
    KG = 'KG',
    LB = 'LB',
    G = 'G',
}
export interface IParcel{
    trackingId: string,
    type: ParcelType,
    weight: number,
    weightUnit?: WeightUnit ,
    sender: Types.ObjectId,
    receiver: Types.ObjectId,
    fromAddress: IAddress,
    toAddress: IAddress,
    fee?: number,
    currentStatus: Status,
    isBlocked?: boolean,
    isCanceled?: boolean,
    estimatedDelivery?: Date,
    actualDelivery?: Date,
    priority?: Priority,
}