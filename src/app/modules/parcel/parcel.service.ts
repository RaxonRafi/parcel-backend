import mongoose, { Types } from "mongoose";
import { generateTrackingId } from "../../utils/trackingIdGen";
import { IParcel, IStatuslog, Status } from "./parcel.interface";
import { Parcel, StatusLog } from "./percel.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes"

export const createParcel=async(Payload:Partial<IParcel>)=>{

    const session = await mongoose.startSession();

    session.startTransaction();

    try {

        const trackingId  = generateTrackingId()

        const {sender,receiver,fromAddress,toAddress,currentStatus, ...rest} = Payload

        const statusLogsPayload ={
                trackingId:trackingId,
                status: Status.REQUESTED,
                updatedBy: new Types.ObjectId(sender),
                timestamp: new Date(),
        };

        const parcel = await Parcel.create([
            {
                trackingId,
                sender,
                receiver,
                fromAddress,
                toAddress,
                currentStatus: Status.REQUESTED,
                ...rest
            }
        ],
            {session}
        );
        await StatusLog.create([statusLogsPayload],{session})

        await session.commitTransaction();
        session.endSession();
        return parcel[0];

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }

}

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

    // Update status
    parcel.currentStatus = newStatus;

    if (newStatus === Status.DELIVERED) {
      parcel.actualDelivery = new Date();
    }

    await parcel.save({ session });

    const statusLog =  await StatusLog.create(
      [
        {
          trackingId,
          status: newStatus,
          updatedBy: new Types.ObjectId(updatedBy),
          location,
          note,
          timestamp: new Date(),
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return statusLog;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const ParcelServices={
    createParcel,
    updateParcelStatus
}