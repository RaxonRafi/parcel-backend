"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStatusZodSchema = exports.createParcelZodSchema = void 0;
const zod_1 = require("zod");
const parcel_interface_1 = require("./parcel.interface");
const mongoose_1 = __importDefault(require("mongoose"));
const addressSchema = zod_1.z.object({
    street: zod_1.z.string().min(1),
    city: zod_1.z.string().min(1),
    state: zod_1.z.string().min(1),
    zipCode: zod_1.z.string().min(1).optional(),
    country: zod_1.z.string().min(1).optional(),
});
exports.createParcelZodSchema = zod_1.z.object({
    type: zod_1.z.enum(parcel_interface_1.ParcelType),
    weight: zod_1.z.number().positive().optional(),
    weightUnit: zod_1.z.enum(parcel_interface_1.WeightUnit).optional(),
    sender: zod_1.z.string().refine(val => mongoose_1.default.Types.ObjectId.isValid(val), {
        message: "Invalid sender ID",
    }),
    receiver: zod_1.z.string().refine(val => mongoose_1.default.Types.ObjectId.isValid(val), {
        message: "Invalid receiver ID",
    }),
    fromAddress: addressSchema,
    toAddress: addressSchema,
    priority: zod_1.z.enum(parcel_interface_1.Priority).optional(),
    estimatedDelivery: zod_1.z.string().datetime().optional(),
    fee: zod_1.z.number().positive().optional(),
});
exports.updateStatusZodSchema = zod_1.z.object({
    status: zod_1.z.enum(parcel_interface_1.Status),
    location: zod_1.z.string().optional(),
    note: zod_1.z.string().optional(),
});
