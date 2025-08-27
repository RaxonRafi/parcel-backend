/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express"
import { catchAsync } from "../../utils/catchAsync"
import { ParcelServices } from "./parcel.service"
import { sendResponse } from "../../utils/sendResponse"
import httpStatus from "http-status-codes"
import AppError from "../../errorHelpers/AppError"


export const createParcel = catchAsync(async (req:Request,res:Response,next:NextFunction)=>{

    const parcel = await ParcelServices.createParcel(req.body)
   
    sendResponse(res,{
        success:true,
        statusCode: httpStatus.CREATED,
        message: "Parcel Created Successfully",
        data: parcel,
    })
})

export const updateParcelStatus = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
     const { trackingId } = req.params;
     const userId = req.user as Record<string, string>
     const {status, location, note} = req.body || {}
       if (!status) {
         throw new AppError(httpStatus.BAD_REQUEST, "Status is required");
      }
   
     const parcel = await ParcelServices.updateParcelStatus(trackingId,userId,{
        status,
        location,
        note
     })
     sendResponse(res,{
        success:true,
        statusCode: httpStatus.ACCEPTED,
        message: "Parcel status Successfully",
        data: parcel,
     })
})
export const cancelParcel = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
     const { trackingId } = req.params;
     const userId = req.user as Record<string, string>
     const {status, updatedBy, location, note} = req.body

     const parcel = await ParcelServices.cancelParcel(trackingId,userId,{
        status,
        updatedBy,
        location,
        note
     })
     sendResponse(res,{
        success:true,
        statusCode: httpStatus.ACCEPTED,
        message: "Parcel Canceled Successfully",
        data: parcel,
     })
})
export const viewParcelAndStatusLogList = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
     const userId = req.user as Record<string, string>
     const parcel = await ParcelServices.viewParcelAndStatusLogList(userId)
     sendResponse(res,{
        success:true,
        statusCode: httpStatus.ACCEPTED,
        message: "Parcel list with status log Successfully",
        data: parcel,
     })
})
export const getParcelsForReceiver = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
     const userId = req.user as Record<string, string>
     const parcel = await ParcelServices.getParcelsForReceiver(userId)
     sendResponse(res,{
        success:true,
        statusCode: httpStatus.ACCEPTED,
        message: "Incomming Parcels!!",
        data: parcel,
     })
})

export const confirmDeliveryByReceiver = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
     const { trackingId } = req.params;
     const userId = req.user as Record<string, string>
     const {note} = req.body

     const parcel = await ParcelServices.confirmDeliveryByReceiver(trackingId,userId,note)
     sendResponse(res,{
        success:true,
        statusCode: httpStatus.ACCEPTED,
        message: "Parcel status Successfully",
        data: parcel,
     })
})
export const getReceiverDeliveryHistory = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{

     const userId = req.user as Record<string, string>

     const parcel = await ParcelServices.getReceiverDeliveryHistory(userId)
     sendResponse(res,{
        success:true,
        statusCode: httpStatus.ACCEPTED,
        message: "Parcel delivery history!!",
        data: parcel,
     })
})
export const getAllParcels = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{

     const query = req.query

     const parcel = await ParcelServices.getAllParcels(query as Record<string,string>)
     sendResponse(res,{
        success:true,
        statusCode: httpStatus.OK,
        message: "All parcels Retrieved Successfully!!",
        data: parcel.data,
        meta: parcel.meta
     })
})
export const getSingleParcel = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{

     const { trackingId } = req.params;

     const parcel = await ParcelServices.getSingleParcel(trackingId)
     sendResponse(res,{
        success:true,
        statusCode: httpStatus.OK,
        message: "parcel Retrieved Successfully!!",
        data: parcel.data,
     })
})

export const blockParcel = catchAsync(async (req: Request, res: Response) => {
  const { trackingId } = req.params;
  const user = req.user as Record<string, string>;
//   const { note, location } = req.body;
  const details = {
      note: req.body?.note || undefined,
      location: req.body?.location || undefined,
   };

  const result = await ParcelServices.blockParcel(trackingId, user, details);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Parcel blocked successfully",
    data: result,
  });
});

export const unblockParcel = catchAsync(async (req: Request, res: Response) => {
  const { trackingId } = req.params;
  const user = req.user as Record<string, string>;
//   const { note, location } = req.body;
  const details = {
      note: req.body?.note || undefined,
      location: req.body?.location || undefined,
   };

  const result = await ParcelServices.unblockParcel(trackingId, user, details);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Parcel unblock successfully",
    data: result,
  });
});

export const ParcelController={
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
    unblockParcel
}