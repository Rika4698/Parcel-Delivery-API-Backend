/* eslint-disable @typescript-eslint/no-unused-vars */
import { JwtPayload } from "jsonwebtoken";
import { IParcel, ParcelStatus } from "./parcel.interface";
import { User } from "../user/user.model";
import AppError from "../../errorHelpers/AppError";
import { StatusCodes } from "http-status-codes";
import { IsActive, Role } from "../user/user.interface";
import { Parcel } from "./parcel.model";
import mongoose from "mongoose";





const createParcel = async (Payload: Partial<IParcel>, decodedUser: JwtPayload) => {
    const sender = await User.findById(decodedUser.userId);

    if(!sender){
        throw new AppError(StatusCodes.BAD_REQUEST, 'User not found.');
    }
    if(sender.role !== Role.SENDER){
        throw new AppError(StatusCodes.FORBIDDEN, 'Only senders can create parcels.');
    }
    if(sender.isDeleted && sender.isActive == IsActive.BLOCKED){
        throw new AppError(StatusCodes.BAD_REQUEST, "You are Deleted or Blocked.");
    }
    if(!Payload.receiverEmail){
        throw new AppError(StatusCodes.BAD_REQUEST, 'Missing required parcels information.');
    }
    const receiver = await User.findOne({ email:Payload.receiverEmail });
    if(!receiver || receiver.role !== Role.RECEIVER){
        throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid receiver.');
    }
    if(!Payload.parcelDetails?.weight){
        throw new AppError(StatusCodes.BAD_REQUEST, 'Parcel weight is required.');
    }
    const fee = (Payload.fee as number) * Payload.parcelDetails?.weight;
    const generateTrakingId = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');

        const random = Math.floor( 100000 + Math.random() * 900000);
        return `TRK-${year}${month}${day}-${random}`;
    };

    const trackingId = generateTrakingId();
    const updatedPayload = {
        ...Payload,
        senderId: sender._id,
        receiverEmail:Payload.receiverEmail,
        trackingId,
        fee,
        statusHistory:[
            {
                status:ParcelStatus.PENDING,
                updatedAt: new Date(),
                updatedBy: sender._id,
            },
        ],
    };
    const parcel = await Parcel.create(updatedPayload);
    return parcel;


};



const updateParcel = async (parcelId: string, payload:Partial<IParcel>, decodedUser:JwtPayload) => {
    const parcel = await Parcel.findById(parcelId);
    if(decodedUser.role !== 'SENDER'){
        throw new AppError(StatusCodes.FORBIDDEN, 'Only sender can update parcel.');
    }
    if(!parcel){
        throw new AppError(StatusCodes.NOT_FOUND, 'Parcel not found.');
    }
    if(parcel.senderId.toString() !== decodedUser.userId){
        throw new AppError(StatusCodes.FORBIDDEN, 'You are not the sender of this parcel.');
    }
    if(payload.currentStatus){
        throw new AppError(
            StatusCodes.FORBIDDEN, 'You are not allowed to update the parcel status.'
        );
    }
    const {currentStatus, statusHistory, ...senderPayload } = payload;
    const updatedParcel = await Parcel.findByIdAndUpdate(parcelId, senderPayload, {new:true, runValidators:true,});

    return updatedParcel;
};



const cancelParcel = async (parcelId:string, decodedUser:JwtPayload) => {
    const session = await mongoose.startSession()
    session.startTransaction();
    try{
        const parcel = await Parcel.findById(parcelId);
        const user = await User.findById(decodedUser.userId);
        if(!parcel){
            throw new AppError(StatusCodes.NOT_FOUND, 'Parcel not found.');
        }
        if(!user){
            throw new AppError(StatusCodes.UNAUTHORIZED, 'User not found.');
        }
        if(parcel.senderId.toString()  !== user._id.toString() || user.role !== Role.SENDER){
            throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to cancel this parcel.');
        }
        if(parcel.currentStatus !== ParcelStatus.PENDING){
            throw new AppError(StatusCodes.BAD_REQUEST,'Only pending parcels can be cancelled.');
        }
        parcel.currentStatus = ParcelStatus.CANCELLED;
       parcel.statusHistory.push({
        status:ParcelStatus.CANCELLED,
        updatedAt: new Date(),
        updatedBy:user._id,
    });
    await parcel.save({session});

    await session.commitTransaction();
    session.endSession()
    return parcel;

    } catch (error){
        await session.abortTransaction();
        session.endSession();
        throw new AppError(StatusCodes.FAILED_DEPENDENCY, 'Transaction failed. Already it cancelled or rolled back.');

    }


    
};



const getAllParcels = async (decodedUser:JwtPayload) => {
    const user = await User.findById(decodedUser.userId);
    if(!user){
        throw new AppError(StatusCodes.NOT_FOUND, 'User not found.');
    }
    let query = {};
    if(user.role === Role.SENDER){
        query = {senderId:user._id};
    } else if(user.role === Role.RECEIVER){
        query = {receiverEmail:user.email};
    } else if (user.role === Role.ADMIN){
        query={};
    }
    const parcels = await Parcel.find(query);
    const totalParcel = await Parcel.countDocuments(query);
    return{
        data:parcels,
        meta: {
            total: totalParcel
        }
    };
};



const receiverIncomingParcels = async (decodedUser:JwtPayload) => {
    const user = await User.findById(decodedUser.userId);

    if(!user){
        throw new AppError(StatusCodes.NOT_FOUND, 'User not found.');
    }
    if(user.role !== Role.RECEIVER) {
        throw new AppError(StatusCodes.FORBIDDEN, 'Only receivers can view incoming parcels.');
    }

    const data = {
        receiverEmail:user.email,
        currentStatus:{ $ne:ParcelStatus.DELIVERED },
    };
    const incomingParcels = await Parcel.find(data);
    const totalIncomingParcels = await Parcel.countDocuments(data);

    return{
        data:incomingParcels,
        meta:{
            total:totalIncomingParcels,
        },
    };
};



const confirmedDelivery  = async (parcelId:string, decodedUser:JwtPayload) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try{
        const receiver = await User.findById(decodedUser.userId).session(session);
        if(!receiver){
            throw new AppError(StatusCodes.NOT_FOUND, 'User not found.');
        }
        if(receiver.role !== Role.RECEIVER){
            throw new AppError(StatusCodes.FORBIDDEN, 'Only receivers can confirm delivery.');
        }
        const parcel = await Parcel.findById(parcelId).session(session);
        if(!parcel){
            throw new AppError(StatusCodes.NOT_FOUND, 'Parcel not found.');
        }
        if(parcel.receiverEmail.toString() !== receiver.email.toString()){
            throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to confirm the parcel.');
        }

        if(parcel.currentStatus === ParcelStatus.DELIVERED){
            throw new AppError(StatusCodes.BAD_REQUEST, 'Parcel is already delivered.');
        }

        parcel.currentStatus = ParcelStatus.DELIVERED;
        parcel.statusHistory.push({
            status:ParcelStatus.DELIVERED,
            updatedAt: new Date(),
            updatedBy:receiver._id,
        });
        await parcel.save({session});
        await session.commitTransaction();
        session.endSession();
        return parcel;
    } catch(error){
        await session.endSession();
        throw new AppError(StatusCodes.FAILED_DEPENDENCY, 'Session Failed.');
    }
};


export const parcelService = {
    createParcel,
    getAllParcels,
    updateParcel,
    cancelParcel,
    receiverIncomingParcels,
    confirmedDelivery,
}
