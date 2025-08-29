/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { UserServices } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes"
import { JwtPayload } from "jsonwebtoken";
import { IUser, Role } from "./user.interface";

const createUser = catchAsync(async (req:Request,res:Response,next:NextFunction)=>{
    const accessToken = req.cookies.accessToken as string || undefined;
    const user = await UserServices.createUser(req.body, accessToken);
    const pending_delivery = req.body.role === Role.PENDING_DELIVERY
    sendResponse(res,{
        success:true,
        statusCode: httpStatus.CREATED,
        message: pending_delivery ? "Registered as pending delivery personnel, waiting for admin approval" 
                : "User Created Successfully",
        data: user,
    })
})
const updateUser = catchAsync(async (req:Request,res:Response,next:NextFunction)=>{
    const decodedToken = req.user as JwtPayload
    const user = await UserServices.updateUser(req.body,decodedToken)
    sendResponse(res,{
        success:true,
        statusCode: httpStatus.CREATED,
        message: "User Updated Successfully",
        data: user,
    })
})
const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await UserServices.getAllUsers(query as Record<string, string>);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "All Users Retrieved Successfully",
        data: result.data,
        meta: result.meta
    })
})

const getSingleUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await UserServices.getSingleUser(id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User Retrieved Successfully",
        data: result.data
    })
})

const getMe = catchAsync(async (req:Request,res:Response,next:NextFunction)=>{
    const decodedToken = req.user as JwtPayload
    const user = await UserServices.getMe(decodedToken.userId)
    sendResponse(res,{
        success:true,
        statusCode: httpStatus.CREATED,
        message: "User Retricved Successfully",
        data: user,
    })
})
const deleteUser = catchAsync(async (req:Request,res:Response,next:NextFunction)=>{
    const id = req.params.id;
    const user = await UserServices.deleteUser(id)
    sendResponse(res,{
        success:true,
        statusCode: httpStatus.CREATED,
        message: "User Deleted Successfully",
        data: user,
    })
})
const blockUser = catchAsync(async (req:Request,res:Response,next:NextFunction)=>{
    const {userId} = req.params
    const user = await UserServices.blockUser(userId)
    sendResponse(res,{
        success:true,
        statusCode: httpStatus.OK,
        message: "User Blocked Successfully",
        data: user,
    })
})
const unblockUser = catchAsync(async (req:Request,res:Response,next:NextFunction)=>{
    const {userId} = req.params
    const user = await UserServices.unblockUser(userId)
    sendResponse(res,{
        success:true,
        statusCode: httpStatus.OK,
        message: "User unblock Successfully",
        data: user,
    })
})
const senderList = catchAsync(async (req:Request,res:Response,next:NextFunction)=>{
    const senders = await UserServices.senderList()
    sendResponse(res,{
        success:true,
        statusCode: httpStatus.OK,
        message: "senders retrived Successfully",
        data: senders,
    })
})
const receiverList = catchAsync(async (req:Request,res:Response,next:NextFunction)=>{
    const receivers = await UserServices.receiverList()
    sendResponse(res,{
        success:true,
        statusCode: httpStatus.OK,
        message: "receivers retrived Successfully",
        data: receivers,
    })
})
const submitNid = catchAsync(async (req:Request,res:Response,next:NextFunction)=>{
     const payload: IUser = {
        ...JSON.parse(req.body.data),
        nidImage: (req.files as Express.Multer.File[]).map(file=> file.path)
    } 

    const decodedToken = req.user as JwtPayload
    const nidDetails =await UserServices.submitNid(payload,decodedToken.userId)
    sendResponse(res,{
        success:true,
        statusCode: httpStatus.OK,
        message: "NID submitted, waiting for admin review",
        data: nidDetails,
    })
})
const approveDeliveryPersonnels = catchAsync(async (req:Request,res:Response,next:NextFunction)=>{

    const userId = req.params.id
    const result = await UserServices.approveDeliveryPersonnels(userId)

    sendResponse(res,{
        success:true,
        statusCode: httpStatus.OK,
        message: "Delivery Personnel Approved successfully!",
        data: result,
    })
})
export const getAllDeliveryPersonnels = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserServices.getAllDeliveryPersonnels();
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Delivery personnels fetched successfully",
      data: result,
    });
  }
);

export const UserController ={
    createUser,
    updateUser,
    getAllUsers,
    getSingleUser,
    deleteUser,
    getMe,
    blockUser,
    unblockUser,
    senderList,
    receiverList,
    submitNid,
    approveDeliveryPersonnels,
    getAllDeliveryPersonnels
}