/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { parcelService } from "./parcel.service";
import { JwtPayload } from "jsonwebtoken";
import { sendResponse } from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";




const createParcel = catchAsync(async (req:Request, res:Response, next:NextFunction) => {
    const decodedUser = req.user;
    const parcel = await parcelService.createParcel(req.body, decodedUser as JwtPayload)
    sendResponse(res, {
        statusCode:StatusCodes.CREATED,
        success:true,
        message:"Parcel created successfully!",
        data:parcel
    })
});


const updateParcel = catchAsync(async(req:Request, res:Response, next:NextFunction) => {
    const decodedUser = req.user;
    const updatedParcel = await parcelService.updateParcel(req.params.id, req.body, decodedUser as JwtPayload)

    sendResponse(res, {
        statusCode:StatusCodes.OK,
        success: true,
        message:'Parcel updated successfully!',
        data:updatedParcel
    });
});



const cancelParcel = catchAsync(async (req:Request, res:Response, next:NextFunction) => {
    const decodedUser = req.user;
    const parcelId = req.params.id;
     await parcelService.cancelParcel(parcelId, decodedUser as JwtPayload);
    sendResponse(res, {
        statusCode:StatusCodes.OK,
        success:true,
        message:'Parcel canceled succcessfully!',
        data:null,
    });
});


const getAllParcels = catchAsync(async (req:Request, res:Response, next:NextFunction) => {
    const decodedUser = req.user;
    const allParcel = await parcelService.getAllParcels(decodedUser as JwtPayload);
    sendResponse(res, {
        statusCode:StatusCodes.OK,
        success:true,
        message:'Parcels received successfully!',
        data: allParcel,
    });
});


const receiverIncomingParcels = catchAsync(async(req:Request, res:Response, next:NextFunction) => {
    const decodedUser = req.user;
    const incomingParcel = await parcelService.receiverIncomingParcels(decodedUser as JwtPayload);

    sendResponse(res, {
        statusCode:StatusCodes.OK,
        success:true,
        message:'Incoming parcels received successfully!',
        data:incomingParcel,
    });
});



const confirmedDelivery = catchAsync(async (req:Request, res:Response, next:NextFunction) => {
    const decodedUser = req.user;

    await parcelService.confirmedDelivery(req.params.id, decodedUser as JwtPayload);
    sendResponse(res, {
        statusCode:StatusCodes.OK,
        success:true,
        message:'Parcel confirm successfully!',
        data:null,
    });

});





export const parcelController = {
    createParcel,
    updateParcel,
    cancelParcel,
    getAllParcels,
    receiverIncomingParcels,
    confirmedDelivery,
}