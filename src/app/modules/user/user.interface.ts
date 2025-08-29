import { Types } from "mongoose";

export enum Role {
  ADMIN = "ADMIN",
  SENDER = "SENDER",
  RECEIVER = "RECEIVER",
  DELIVERY_PERSONNEL="DELIVERY_PERSONNEL",
  PENDING_DELIVERY="PENDING_DELIVERY"
}

export interface IAuthProvider {
  provider: "google" | "credentials";
  providerId: string;
}

export enum IsActive {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  picture?: string;
  address?: string;
  isDeleted?: string;
  isActive?: IsActive;
  isVerified?: boolean;
  role: Role;
  auths: IAuthProvider[];
  parcel?: Types.ObjectId[];
  nidNumber?: string,
  nidImage?: string[],
  deleteImages?: string[]
}
