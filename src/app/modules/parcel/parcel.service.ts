import mongoose, { Types } from "mongoose";
import { generateTrackingId } from "../../utils/trackingIdGen";
import { IParcel, IStatuslog, Status } from "./parcel.interface";
import { Parcel } from "./percel.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes"
import { QueryBuilder } from "../../utils/QueryBuilder";
import { ParcelSearchableFields } from "./parcel.constants";
import { Role } from "../user/user.interface";
import { sendEmail } from "../../utils/sendEmail";
import { User } from "../user/user.model";
import { envVars } from "../../config/env";

export const createParcel = async (Payload: Partial<IParcel>) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const trackingId = generateTrackingId();
    const { sender, receiver, fromAddress, toAddress, ...rest } = Payload;
    const SenderData = await User.findById(sender).select("name email");
    const statusLog: IStatuslog = {
      status: Status.REQUESTED,
      updatedBy: new Types.ObjectId(sender),
      timestamp: new Date(),
      note: "Parcel created",
    };

    const parcel = await Parcel.create(
      [
        {
          trackingId,
          sender,
          receiver,
          fromAddress,
          toAddress,
          currentStatus: Status.REQUESTED,
          statusLogs: [statusLog],
          ...rest,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    // Send email to sender
    await sendEmail({
      to: SenderData?.email || "user@example.com",
      subject: `Parcel Created: ${trackingId}`,
      templateName: "parcelCreated", 
      templateData: { trackingId, fromAddress, toAddress, senderName: SenderData?.name,baseUrl: envVars.FRONTEND_URL},
    });
    return parcel[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const updateParcelStatus = async (
  trackingId: string,
  user: Record<string, string>,
  newStatusLog: Partial<IStatuslog>
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const parcel = await Parcel.findOne({ trackingId }).session(session);
    const { status: newStatus, location, note } = newStatusLog;
    const updatedBy = user.userId;

    if (!newStatus) {
      throw new AppError(httpStatus.BAD_REQUEST, "Status is required");
    }
    if (!updatedBy) {
      throw new AppError(httpStatus.BAD_REQUEST, "updatedBy is required");
    }
    if (!parcel) {
      throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
    }

    if (parcel.isCanceled) {
      throw new AppError(httpStatus.BAD_REQUEST, "Parcel is canceled and cannot be updated");
    }

    if (parcel.isBlocked) {
      throw new AppError(httpStatus.BAD_REQUEST, "Parcel is blocked and cannot be updated");
    }

    const validTransitions: Record<Status, Status[]> = {
      [Status.REQUESTED]: [Status.APPROVED, Status.CANCELED, Status.BLOCKED],
      [Status.APPROVED]: [Status.DISPATCHED, Status.CANCELED, Status.BLOCKED],
      [Status.DISPATCHED]: [Status.IN_TRANSIT, Status.BLOCKED],
      [Status.IN_TRANSIT]: [Status.DELIVERED, Status.BLOCKED],
      [Status.DELIVERED]: [],
      [Status.CANCELED]: [],
      [Status.BLOCKED]: [],
    };

    const currentStatus = parcel.currentStatus;
    const allowedNext = validTransitions[currentStatus];

    if (!allowedNext.includes(newStatus)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Invalid status transition from ${currentStatus} → ${newStatus}`
      );
    }

    parcel.currentStatus = newStatus;

    if (newStatus === Status.DELIVERED) {
      parcel.actualDelivery = new Date();
    }

    parcel.statusLogs.push({
      status: newStatus,
      updatedBy: new Types.ObjectId(updatedBy),
      location,
      note,
      timestamp: new Date(),
    });

    await parcel.save({ session });

    await session.commitTransaction();
    session.endSession();

    return parcel;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};


export const cancelParcel = async (
  trackingId: string,
  user: Record<string, string>,
  newStatusLog: Partial<IStatuslog>
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
 
  try {
    const parcel = await Parcel.findOne({ trackingId }).session(session);
    const updatedBy = user.userId;
    const receiverData = await User.findById(parcel?.receiver).select("name email");
    if (!parcel) {
      throw new AppError(httpStatus.BAD_REQUEST, "Parcel Not Available!!!");
    }

    if (parcel.sender.toString() !== updatedBy) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not allowed to cancel this parcel");
    }

    if (parcel.isCanceled) {
      throw new AppError(httpStatus.BAD_REQUEST, "Parcel is already canceled!!!");
    }

    if (parcel.isBlocked) {
      throw new AppError(httpStatus.BAD_REQUEST, "Parcel is already blocked!!!");
    }

    const notAllowedPath = [Status.DISPATCHED, Status.IN_TRANSIT, Status.DELIVERED];

    if (notAllowedPath.includes(parcel.currentStatus)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Parcel is already ${parcel.currentStatus}. Can't cancel it.`
      );
    }

    parcel.currentStatus = Status.CANCELED;
    parcel.isCanceled = true;

    parcel.statusLogs.push({
      status: Status.CANCELED,
      updatedBy: new Types.ObjectId(updatedBy),
      timestamp: new Date(),
      note: newStatusLog.note,
      location: newStatusLog.location,
    });

    await parcel.save({ session });

    await session.commitTransaction();
    session.endSession();
    await sendEmail({
    to: receiverData?.email || "receiver@example.com",
    subject: `Parcel Canceled: ${trackingId}`,
    templateName: "parcelCanceled",
    templateData: { trackingId, note: newStatusLog.note },
  });
    return parcel;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};


export const viewParcelAndStatusLogList = async (user: Record<string, string>) => {
  const userId = user.userId;

  if (!userId) {
    throw new AppError(httpStatus.BAD_REQUEST, "User ID is missing");
  }

  const parcels = await Parcel.find({ sender: new Types.ObjectId(userId) }).populate("statusLogs.updatedBy");

  return parcels.map(parcel => parcel.toObject());
};

export const getParcelsForReceiver = async (user: Record<string, string>) => {
  const userId = user.userId;

  if (!userId) {
    throw new AppError(httpStatus.BAD_REQUEST, "User ID is missing");
  }

  const parcels = await Parcel.find({ receiver: new Types.ObjectId(userId) });

  return parcels.map(parcel => parcel.toObject());
};

export const confirmDeliveryByReceiver = async (
  trackingId: string,
  user: Record<string, string>,
  note?: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = user.userId;

    const parcel = await Parcel.findOne({ trackingId }).session(session);
    const senderData = await User.findById(parcel?.sender).select("name email");
    if (!parcel) {
      throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
    }

    if (user.role !== Role.RECEIVER) {
        throw new AppError(httpStatus.FORBIDDEN, "Only receiver can confirm delivery");
    }
    if (parcel.receiver.toString() !== userId) {
      throw new AppError(httpStatus.FORBIDDEN, "Not authorized to confirm this delivery");
    }

    if (parcel.currentStatus !== Status.IN_TRANSIT) {
      throw new AppError(httpStatus.BAD_REQUEST, "Parcel is not in transit and cannot be marked as delivered");
    }


    parcel.currentStatus = Status.DELIVERED;
    parcel.actualDelivery = new Date();

    parcel.statusLogs.push({
      status: Status.DELIVERED,
      updatedBy: new Types.ObjectId(userId),
      note,
      timestamp: new Date(),
      location: "DELIVERED BY RECEIVER",
    });

    await parcel.save({ session });

    await session.commitTransaction();
    session.endSession();
    // Send email
    await sendEmail({
      to: senderData?.email || "sender@example.com",
      subject: `Parcel Delivered: ${trackingId}`,
      templateName: "parcelDelivered",
      templateData: { trackingId, note, deliveredBy: user.name },
    });
    return parcel;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const getReceiverDeliveryHistory = async (user: Record<string, string>) => {
  const receiverId = user.userId;

  const parcels = await Parcel.find({
    receiver: new Types.ObjectId(receiverId),
    currentStatus: Status.DELIVERED,
  });

  const result = parcels.map(parcel => ({
    ...parcel.toObject(),
    statusLogs: parcel.statusLogs || [],
  }));

  return result;
};

export const getAllParcels=async(query:Record<string,string>)=>{
  const queryBuilder = new QueryBuilder(
    Parcel.find()
    .populate("sender")
    .populate("receiver"),
    query)
  const parcelData = queryBuilder
  .filter()
  .search(ParcelSearchableFields)
  .sort()
  .fields()
  .paginate()


  const [data, meta] = await Promise.all([
    parcelData.build(),
    queryBuilder.getMeta()
  ])

  return {
    data,
    meta
  }

}

const getSingleParcel = async (trackingId: string) => {
    const parcel = await Parcel.findOne({trackingId});
    return {
        data: parcel
    }
};

const blockParcel = async (
  trackingId: string,
  user: Record<string, string>,
  details: { location?: string; note?: string }
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const parcel = await Parcel.findOne({ trackingId }).session(session);
    const updatedBy = user.userId;
    const receiverData = await User.findById(parcel?.receiver).select("name email");

    if (!parcel) {
      throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
    }

    if (parcel.isBlocked) {
      throw new AppError(httpStatus.BAD_REQUEST, "Parcel is already blocked");
    }

    if (
      parcel.currentStatus === Status.DELIVERED ||
      parcel.currentStatus === Status.CANCELED
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Parcel is already ${parcel.currentStatus} and cannot be blocked`
      );
    }

    parcel.isBlocked = true;
    parcel.currentStatus = Status.BLOCKED;

    parcel.statusLogs.push({
      status: Status.BLOCKED,
      updatedBy: new Types.ObjectId(updatedBy),
      timestamp: new Date(),
      location: details.location || "BLOCKED",
      note: details.note || "Parcel was blocked",
    });

    await parcel.save({ session });

    await session.commitTransaction();
    session.endSession();
    // Send email to receiver/sender
    await sendEmail({
      to: receiverData?.email || "receiver@example.com",
      subject: `Parcel Blocked: ${trackingId}`,
      templateName: "parcelBlocked",
      templateData: { trackingId, note: details.note, location: details.location },
    });
    return parcel;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const unblockParcel = async (trackingId: string, user: Record<string, string>,  details: { location?: string; note?: string }) => {
  const parcel = await Parcel.findOne({ trackingId });
  if (!parcel) throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");

  parcel.isBlocked = false;
  parcel.currentStatus = Status.APPROVED;
  const updatedBy = user.userId;
  parcel.statusLogs.push({
    status: Status.APPROVED, 
    updatedBy: new Types.ObjectId(updatedBy),
    location: details.location,
    note: details.note || "Parcel was unblocked",
  });

  return parcel.save();
};

const assignDeliveryPersonnel = async(trackingId:string,deliveryPersonnel:string)=>{
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const parcel = await Parcel.findOne({trackingId}).session(session);
        if (!parcel) {
      throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
    }

    const user = await User.findById(deliveryPersonnel).session(session);
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "Delivery personnel not found");
    }

    if (user.role !== Role.DELIVERY_PERSONNEL) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "User is not a delivery personnel"
      );
    }
    parcel.deliveryPersonnel = user._id
    await parcel.save({session})
    session.endSession()
    return parcel;


  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }

}

export const ParcelServices={
    createParcel,
    updateParcelStatus,
    cancelParcel,
    viewParcelAndStatusLogList,
    getParcelsForReceiver,
    confirmDeliveryByReceiver,
    getReceiverDeliveryHistory,
    getAllParcels,
    getSingleParcel,
    blockParcel,
    unblockParcel,
    assignDeliveryPersonnel
}