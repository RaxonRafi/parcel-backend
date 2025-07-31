import cookieParser from "cookie-parser"
import cors from "cors"
import express, { Request, Response } from "express"
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler"
import notFound from "./app/middlewares/notFound"
import { router } from "./app/routes"
import passport from "passport"
import "./app/config/passport"
import expressSession from "express-session"
import { envVars } from "./app/config/env"
const app = express()

app.use(expressSession({
    secret: envVars.JWT_ACCESS_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors())
app.use("/api/v1",router)

app.get("/",(req:Request,res:Response)=>{
    res.send("Welcome to Parcel App!!!")
})


app.use(globalErrorHandler);
app.use(notFound);

export default app;