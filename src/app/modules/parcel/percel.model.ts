
import { model, Schema } from "mongoose";
import { IAddress, IParcel, IStatuslog, ParcelType, Priority, Status, WeightUnit } from "./parcel.interface";


const StatuslogSchema = new Schema<IStatuslog>({
    trackingId:{
        type: String,
        ref:'Parcel',
        required: true
    },
    status: {
        type: String,
        enum: Object.values(Status),
        required: true
    },
    location: {
        type: String,
        required: false
    },
    note: {
        type: String,
        required: false
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const AddressSchema = new Schema<IAddress>({
    street: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    zipCode: {
        type: String,
        required: true,
        trim: true
    },
    country: {
        type: String,
        required: true,
        trim: true
    }
}, { _id: false });

const ParcelSchema = new Schema<IParcel>({
    trackingId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    type: {
        type: String,
        enum: Object.values(ParcelType),
        required: true
    },
    weight: {
        type: Number,
        required: true,
        min: 0
    },
    weightUnit: {
        type: String,
        enum: Object.values(WeightUnit),
        default: WeightUnit.KG
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fromAddress: {
        type: AddressSchema,
        required: true
    },
    toAddress: {
        type: AddressSchema,
        required: true
    },
    fee: {
        type: Number,
        min: 0
    },
    currentStatus: {
        type: String,
        enum: Object.values(Status),
        default: Status.REQUESTED
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isCanceled: {
        type: Boolean,
        default: false
    },
    estimatedDelivery: {
        type: Date
    },
    actualDelivery: {
        type: Date
    },
    priority: {
        type: String,
        enum: Object.values(Priority),
        default: Priority.NORMAL
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});


export const Parcel = model<IParcel>('Parcel', ParcelSchema);
export const StatusLog = model<IStatuslog>('StatusLog', StatuslogSchema);