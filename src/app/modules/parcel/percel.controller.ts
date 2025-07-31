import { NextFunction, Request, Response } from "express"
import { catchAsync } from "../../utils/catchAsync"
import { ParcelServices } from "./parcel.service"
import { sendResponse } from "../../utils/sendResponse"
import httpStatus from "http-status-codes"


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
     const {status, updatedBy, location, note} = req.body

     const parcel = await ParcelServices.updateParcelStatus(trackingId,userId,{
        status,
        updatedBy,
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



export const ParcelController={
    createParcel,
    updateParcelStatus
}