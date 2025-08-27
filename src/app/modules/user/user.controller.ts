/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { UserServices } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes"
import { JwtPayload } from "jsonwebtoken";
import { IUser } from "./user.interface";

const createUser = catchAsync(async (req:Request,res:Response,next:NextFunction)=>{
    const accessToken = req.cookies.accessToken as string || undefined;
    const user = await UserServices.createUser(req.body, accessToken);

    sendResponse(res,{
        success:true,
        statusCode: httpStatus.CREATED,
        message: "User Created Successfully",
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
    receiverList
}