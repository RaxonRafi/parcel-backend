import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status-codes"
import bcryptjs from "bcryptjs"
import { envVars } from "../../config/env";


const createUser = async (payload: Partial<IUser>)=>{
    const {email, password,role, ...rest} = payload;
    const isUserExists = await User.findOne({email})

    if(isUserExists){
        throw new AppError(httpStatus.BAD_REQUEST,"User already exists!!")
    }
    if(role === Role.ADMIN){
        throw new AppError(httpStatus.BAD_REQUEST,"Unathorized!")
    }

    const userRole = role === Role.SENDER || role === Role.RECEIVER ? role : Role.SENDER
    
    const hashedPassword = await bcryptjs.hash(password as string,Number(envVars.BCRYPT_SALT_ROUND))

    const authProvider: IAuthProvider = {provider:"credentials",providerId:email as string}
    const user = await User.create({
        email,
        password: hashedPassword,
        role:userRole,
        isVerified:true,
        auths:[authProvider],
        ...rest
    })
    return user;

}
// const updateUser = async (userId: string,payload: Partial<IUser>,decodedToken: JwtPayload)=>{

//     if(decodedToken.role === Role.SENDER || Role.RECEIVER){
//         if(userId !== decodedToken.userId){
//             throw new AppError(410,"you are authorized")
//         }
//     }
//     const ifUserExist = await User.findById(userId);

//     if (!ifUserExist) {
//         throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
//     }
    
//     if (decodedToken.role === Role.SENDER && ifUserExist.role === Role.SUPER_ADMIN) {
//         throw new AppError(401, "You are not authorized")
//     }

// }


export const UserServices = {
    createUser
}