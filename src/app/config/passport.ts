/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import passport from "passport";
import { Strategy as LocalStrategy} from "passport-local";
import bcryptjs from "bcryptjs"
import { IsActive } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";


passport.use(
    new LocalStrategy({
        usernameField: "email",
        passwordField: "password"
    }, async (email: string, password: string, done) => {
        try {
            const isUserExist = await User.findOne({ email })

            if (!isUserExist) {
                return done(null, false, { message: "User does not exist" });

            }
            if (isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE) {
                 return done(null, false, { message:`User is ${isUserExist.isActive}`})
            }
            if (isUserExist.isDeleted) {
                return done(null, false, { message:"User is deleted"})
            }

            const isPasswordMatched = await bcryptjs.compare(password as string, isUserExist.password as string)

            if (!isPasswordMatched) {
                return done(null, false, { message: "Password does not match" })
            }

            return done(null, isUserExist)

        } catch (error) {
            console.log(error);
            done(error)
        }
    })
)

passport.serializeUser((user: any, done:(err:any,id?:unknown)=>void)=>{
    done(null,user._id)
})

passport.deserializeUser(async(id:string, done:any)=>{
    try {
        const user = await User.findById(id);
        done(null,user)
    } catch (error) {
      
        console.log(error);
        done(error)
    }
})