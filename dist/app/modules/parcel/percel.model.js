"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parcel = void 0;
const mongoose_1 = require("mongoose");
const parcel_interface_1 = require("./parcel.interface");
// Subdocument schema for status logs
const StatuslogSchema = new mongoose_1.Schema({
    status: {
        type: String,
        enum: Object.values(parcel_interface_1.Status),
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { _id: false }); // Avoid generating a separate _id for each status log
// Address schema
const AddressSchema = new mongoose_1.Schema({
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true }
}, { _id: false });
// Parcel schema
const ParcelSchema = new mongoose_1.Schema({
    trackingId: { type: String, required: true, unique: true, trim: true, uppercase: true },
    type: { type: String, enum: Object.values(parcel_interface_1.ParcelType), required: true },
    weight: { type: Number, required: true, min: 0 },
    weightUnit: { type: String, enum: Object.values(parcel_interface_1.WeightUnit), default: parcel_interface_1.WeightUnit.KG },
    sender: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    fromAddress: { type: AddressSchema, required: true },
    toAddress: { type: AddressSchema, required: true },
    fee: { type: Number, min: 0 },
    currentStatus: { type: String, enum: Object.values(parcel_interface_1.Status), default: parcel_interface_1.Status.REQUESTED },
    isBlocked: { type: Boolean, default: false },
    isCanceled: { type: Boolean, default: false },
    estimatedDelivery: { type: Date },
    actualDelivery: { type: Date },
    priority: { type: String, enum: Object.values(parcel_interface_1.Priority), default: parcel_interface_1.Priority.NORMAL },
    statusLogs: { type: [StatuslogSchema], default: [] }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
exports.Parcel = (0, mongoose_1.model)('Parcel', ParcelSchema);
