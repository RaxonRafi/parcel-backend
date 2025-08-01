/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { JwtPayload } from "jsonwebtoken"
import { createNewAccessTokenWithRefreshToken } from "../../utils/userTokens"
import { User } from "../user/user.model"
import bcryptjs from "bcryptjs"
import AppError from "../../errorHelpers/AppError"
import { envVars } from "../../config/env"
import httpStatus from "http-status-codes"

const getNewAccessToken = async (refreshToken : string) =>{

    const newAccessToken = await createNewAccessTokenWithRefreshToken(refreshToken)

    return {
        accessToken : newAccessToken
    }

  
}

const changePassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {

    const user = await User.findById(decodedToken.userId)

    const isOldPasswordMatch = await bcryptjs.compare(oldPassword, user!.password as string)
    
    if (!isOldPasswordMatch) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Old Password does not match");
    }

    user!.password = await bcryptjs.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUND))
    user!.save();


}
export const AuthServices = {
    getNewAccessToken,
    changePassword,
}