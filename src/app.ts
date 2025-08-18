import express, { Request, Response } from "express";
import cors from "cors";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import { notFound } from "./app/middlewares/notFound";


const app = express()

app.use(cors());
app.use(express.json());

app.get("/", (req:Request, res:Response)=>{
    res.status(200).json({
        message:'Welcome to Parcel Delivery API',
    });

});

app.use(globalErrorHandler)
app.use(notFound)


export default app;