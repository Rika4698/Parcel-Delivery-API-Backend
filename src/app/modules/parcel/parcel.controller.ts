/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { parcelService } from "./parcel.service";
import { JwtPayload } from "jsonwebtoken";
import { sendResponse } from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";
import { Parcel } from "./parcel.model";
import AppError from "../../errorHelpers/AppError";




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
        message:'Parcel delivery canceled successfully!',
        data:null,
    });
});




const getAllParcels = catchAsync(async (req:Request, res:Response, next:NextFunction) => {
    const decodedUser = req.user;
    const query = req.query;
    const allParcel = await parcelService.getAllParcels(decodedUser as JwtPayload, query as Record<string, string>);

    sendResponse(res, {
        statusCode:StatusCodes.OK,
        success:true,
        message:'Parcels received successfully!',
        data: allParcel,
    });
});




const getAParcel = catchAsync(async (req:Request, res:Response, next:NextFunction) => {
    const decodedUser = req.user;

    const Parcel = await parcelService.getAParcel(req.params.id, decodedUser as JwtPayload);

    sendResponse(res, {
        statusCode:StatusCodes.OK,
        success:true,
        message:'Parcel received successfully!',
        data: Parcel,
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



const deliveryHistory = catchAsync(async (req:Request, res:Response, next:NextFunction) => {
    const decodedUser = req.user;
    const history = await parcelService.deliveryHistory(decodedUser as JwtPayload, req.query as Record<string, string>);

    sendResponse(res, {
        statusCode:StatusCodes.OK,
        success:true,
        message:'Delivery history received successfully!',
        data:history,
    });
});




const updateParcelStatus = catchAsync(async (req: Request, res:Response, next:NextFunction) => {
    const decodedUser = req.user;
    const updateStatus = await parcelService.updateParcelStatus(req.params.id, req.body, decodedUser as JwtPayload);

    sendResponse(res, {
        statusCode:StatusCodes.OK,
        success:true,
        message:'Parcel status update successfully!',
        data: updateStatus,
    });
});



const trackParcel = catchAsync(async (req:Request, res:Response, next:NextFunction) => {
    const trackId = req.params.trackingId;
    const match = await Parcel.findOne({trackingId:trackId});

    if(!match){
        throw new AppError(StatusCodes.NOT_FOUND, 'Parcel not found with this tracking ID!');
    }

    const parcel = await Parcel.findOne({
      trackingId: req.params.trackingId,
    })
      .select('-trackingId -isDeleted')
      .populate('senderId', 'name email phone -_id')
      .populate('statusHistory.updatedBy', 'role -_id');

    sendResponse(res, {
        statusCode:StatusCodes.OK,
        success:true,
        message:'Parcel received successfully!',
        data:parcel,
    });
});




const deleteParcel = catchAsync(async (req:Request, res:Response, next:NextFunction) => {
    const decodedUser = req.user;
    await parcelService.deleteParcel(req.params.id, decodedUser as JwtPayload);

    sendResponse(res, {
        statusCode:StatusCodes.OK,
        success:true,
        message:'Parcel deleted successfully!',
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
    updateParcelStatus,
    getAParcel,
    deliveryHistory,
    trackParcel,
    deleteParcel,
};