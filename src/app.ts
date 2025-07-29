import cookieParser from "cookie-parser"
import cors from "cors"
import express, { Request, Response } from "express"
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler"
import notFound from "./app/middlewares/notFound"

const app = express()

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors())
// app.use("/api/v1")

app.get("/",(req:Request,res:Response)=>{
    res.send("Welcome to Parcel App!!!")
})


app.use(globalErrorHandler);
app.use(notFound);

export default app;