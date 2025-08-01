import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { UserServices } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes"
import { JwtPayload } from "jsonwebtoken";

const createUser = catchAsync(async (req:Request,res:Response,next:NextFunction)=>{
    const user = await UserServices.createUser(req.body)
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

export const UserController ={
    createUser,
    updateUser,
    getAllUsers,
    getSingleUser,
    getMe,
    blockUser,
    unblockUser
}