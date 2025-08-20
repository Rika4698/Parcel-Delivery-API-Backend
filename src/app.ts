import express, { Request, Response } from "express";
import cors from "cors";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import { notFound } from "./app/middlewares/notFound";
import { router } from "./app/routes";


const app = express()

app.use(cors());
app.use(express.json());

app.use("/api/v1", router);

app.get("/", (req:Request, res:Response)=>{
    res.status(200).json({
        message:'Welcome to Parcel Delivery API',
    });

});

app.use(globalErrorHandler)
app.use(notFound)


export default app;