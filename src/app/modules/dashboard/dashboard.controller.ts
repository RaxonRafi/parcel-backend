/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express"
import { catchAsync } from "../../utils/catchAsync"
import { sendResponse } from "../../utils/sendResponse"
import httpStatus from "http-status-codes";
import { DashBoardServices} from "./dashboard.service";


const getDashboardStates = catchAsync(async (req:Request,res:Response,next:NextFunction)=>{
    const stats = await DashBoardServices.getDashboardStates();

    sendResponse(res,{
        success:true,
        statusCode: httpStatus.OK,
        message: "Dashboard Stats retrived Successfully",
        data: stats,
    })
})

export const DashboardController ={
    getDashboardStates
}