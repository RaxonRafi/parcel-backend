/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";
import { envVars } from "../config/env";
import { handleDuplicateError } from "../helpers/handleDuplicateError";
import { handleCastError } from "../helpers/handleCastError";
import { handleZodError } from "../helpers/handlerZodError";
import { handleValidationError } from "../helpers/handlerValidationError";


export const globalErrorHandler =async (err: any, req: Request, res: Response,next: NextFunction)=>{
    // if(req.file){
    //     await deleteImageFromCloudinary(req.file.path)
    // }
    // if(req.files && Array.isArray(req.files) && req.files.length > 0){
    //   const imageUrls = (req.files as Express.Multer.File[]).map(file => file.path)
    //   await Promise.all(imageUrls.map(url => deleteImageFromCloudinary(url)))
    // }

    let statusCode = 500;
    let message = "Something Went Wrong!!";

    let errorSources: any = []
    if(err.code === 11000){
        const simplifiedError = handleDuplicateError(err)
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message
    } else if(err.name === "CastError"){
        const simplifiedError = handleCastError(err)
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message
    }
    else if(err.name === "ZodError"){
        const simplifiedError = handleZodError(err)
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message
        errorSources = simplifiedError.errorSources
    }
    
    else if(err.name === "ValidationError"){
        const simplifiedError = handleValidationError(err)
        statusCode = simplifiedError.statusCode;
        errorSources = simplifiedError.errorSources
        message = simplifiedError.message
    }
    else if(err instanceof AppError){
        statusCode = err.statusCode;
        message = err.message;
    } else if(err instanceof Error){
        statusCode = 500;
        message = err.message
    }
    res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        err: envVars.NODE_ENV === "development" ? err : null,
        stack: envVars.NODE_ENV === "development" ? err.stack : null
    })
}