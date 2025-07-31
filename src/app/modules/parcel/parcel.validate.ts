import { z } from "zod";
import { ParcelType, Priority, WeightUnit, Status } from "./parcel.interface";
import mongoose from "mongoose";


const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
});


export const createParcelZodSchema = z.object({
  type: z.enum(ParcelType),
  weight: z.number().positive().optional(),
  weightUnit: z.enum(WeightUnit).optional(),
  sender: z.string().refine(val => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid sender ID",
  }),
  receiver: z.string().refine(val => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid receiver ID",
  }),
  fromAddress: addressSchema,
  toAddress: addressSchema,
  priority: z.enum(Priority).optional(),
  estimatedDelivery: z.string().datetime().optional(),
  fee: z.number().positive().optional(), 
});

export const updateStatusZodSchema = z.object({
  status: z.enum(Status),
  location: z.string().optional(),
  note: z.string().optional(),
});
