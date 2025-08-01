/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes"
import { catchAsync } from "../../utils/catchAsync";
import passport from "passport";
import AppError from "../../errorHelpers/AppError";
import { createUserTokens } from "../../utils/userTokens";
import { setAuthCookie } from "../../utils/setCookie";
import { sendResponse } from "../../utils/sendResponse";
import { AuthServices } from "./auth.service";
import { JwtPayload } from "jsonwebtoken";


const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction)=>{
    passport.authenticate("local", async(err: any, user: any, info: any)=>{

        if(err){
            return next(new AppError(err.statusCode || 401, err.message))
        }

        if (!user) {
            return next(new AppError(401, info?.message || "Invalid credentials"))
        }
        console.log("Passport info:", info)
        const userTokens = await createUserTokens(user)

        const {password: pass , ...rest} = user.toObject()

        setAuthCookie(res,userTokens)

        sendResponse(res,{
            success: true,
            statusCode: httpStatus.OK,
            message: "User Logged In Successfully",
            data: {
                accessToken: userTokens.accessToken,
                refreshToken: userTokens.refreshToken,
                user : rest
            },
        })
    })(req, res, next)


})
const getNewAccessToken = catchAsync(async (req: Request,res:Response,next: NextFunction)=>{
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
        throw new AppError(httpStatus.BAD_REQUEST, "No refresh token recieved from cookies")
    }

    const tokenInfo = await AuthServices.getNewAccessToken(refreshToken)
    setAuthCookie(res,tokenInfo)

    sendResponse(res,{
        success: true,
        statusCode: httpStatus.OK,
        message: "New AccessToken retrived Successfully",
        data: tokenInfo,
    })
})

const logout = catchAsync(async (req: Request, res: Response, next: NextFunction)=>{
    
    res.clearCookie("accessToken",{
        httpOnly:true,
        secure:false,
        sameSite:"lax"
    })
    res.clearCookie("refreshToken",{
        httpOnly:true,
        secure:false,
        sameSite:"lax"
    })
   
    sendResponse(res,{
        success: true,
        statusCode: httpStatus.OK,
        message: "User Logged out Successfully",
        data: null,
    })
})
const changePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;
    const decodedToken = req.user

    await AuthServices.changePassword(oldPassword, newPassword, decodedToken as JwtPayload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Password Changed Successfully",
        data: null,
    })
})

export const AuthControllers ={
    credentialsLogin,
    getNewAccessToken,
    logout,
    changePassword
}