/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { JwtPayload } from "jsonwebtoken";
import { IParcel, ParcelStatus } from "./parcel.interface";
import { User } from "../user/user.model";
import AppError from "../../errorHelpers/AppError";
import { StatusCodes } from "http-status-codes";
import { IsActive, Role } from "../user/user.interface";
import { Parcel } from "./parcel.model";
import mongoose from "mongoose";

import { notAllowedStatus} from "../../constants";





const createParcel = async (Payload: Partial<IParcel>, decodedUser: JwtPayload) => {

    const session = await mongoose.startSession();
    session.startTransaction();

    try{
        const sender = await User.findById(decodedUser.userId).session(session);

        if(!sender){
        throw new AppError(StatusCodes.BAD_REQUEST, 'User not found.');
    }

       if(sender.role !== Role.SENDER){
        throw new AppError(StatusCodes.FORBIDDEN, 'Only senders can create parcels.');
    }

    if(decodedUser.email  ===  Payload.receiverEmail){
        throw new AppError(StatusCodes.FORBIDDEN, 'You cannot sent parcel to you.')
    }

    if(sender.isDeleted || sender.isActive == IsActive.BLOCKED){
        throw new AppError(StatusCodes.BAD_REQUEST, "Account is deleted or blocked.");
    }

    if(!Payload.receiverEmail){
        throw new AppError(StatusCodes.BAD_REQUEST, 'Receiver email is required.');
    }


    // const receiver = await User.findOne({ email:Payload.receiverEmail }).session(session);

    //  if(!receiver || receiver.role !== Role.RECEIVER){
    //     throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid receiver.');
    // }

    const pay = Payload.parcelDetails?.weight;
     if(!pay){
        throw new AppError(StatusCodes.BAD_REQUEST, 'Parcel weight is required.');
    }

    const fee = (Payload.fee as number) * pay;

    const generateTrackingId = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');

        const random = Math.floor( 100000 + Math.random() * 900000);
        return `TRK-${year}${month}${day}-${random}`;
    };

    const trackingId = generateTrackingId();

    const updatedPayload = await Parcel.create(
    [
        {
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
    },
],
  {session}
);
   sender.Parcels.push(updatedPayload[0]._id);
   await sender.save({session});

   await session.commitTransaction();
   session.endSession();

    
    return updatedPayload[0];

} catch(error:any){
    await session.abortTransaction();
    session.endSession();
    throw new AppError(StatusCodes.FAILED_DEPENDENCY, error.message);
}
    

};








const updateParcel = async (parcelId: string, payload:Partial<IParcel>, decodedUser:JwtPayload) => {
    const parcel = await Parcel.findById(parcelId);

    const user = await User.findById(decodedUser.userId);

    if(decodedUser.role === Role.RECEIVER){
        throw new AppError(StatusCodes.FORBIDDEN, 'Only sender and admin can update parcel.');
    }

    if(!parcel){
        throw new AppError(StatusCodes.NOT_FOUND, 'Parcel not found.');
    }
    
    if(user?.isActive === IsActive.BLOCKED){
        throw new AppError(StatusCodes.BAD_REQUEST, 'User is blocked.');
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
    const updateFields: any = {};


for (const key of Object.keys(senderPayload)) {
  if (key === 'parcelDetails' && senderPayload.parcelDetails) {
   
    for (const nestedKey of Object.keys(senderPayload.parcelDetails)) {
      updateFields[`parcelDetails.${nestedKey}`] = senderPayload.parcelDetails[nestedKey as keyof typeof senderPayload.parcelDetails];
    }
  } else {
    updateFields[key] = senderPayload[key as keyof typeof senderPayload];
  }
}

   
const updatedParcel = await Parcel.findByIdAndUpdate(
  parcelId,
  { $set: updateFields },
  { new: true, runValidators: true }
);

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

        if(user?.isActive === IsActive.BLOCKED) {
            throw new AppError(StatusCodes.BAD_REQUEST, 'User is blocked.');
        }


        if(!user){
            throw new AppError(StatusCodes.UNAUTHORIZED, 'User not found.');
        }


        if(parcel.senderId.toString()  !==  user._id.toString() || user.role !== Role.SENDER){
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

    } catch (error:any){
        await session.abortTransaction();
        session.endSession();
        throw new AppError(StatusCodes.FAILED_DEPENDENCY, error.message);

    }
};




const getAParcel = async (parcelId:string, decodedUser:JwtPayload) => {
    const user = await User.findById(decodedUser.userId);

    if(!user) {
        throw new AppError(StatusCodes.NOT_FOUND, 'User not found.');
    }

    if(user.isActive === IsActive.BLOCKED) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'User is blocked.');
    }

    const parcel = await Parcel.findById(parcelId);

    if(!parcel) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Parcel not found');
    }

    if(user.role === Role.SENDER && parcel.senderId.toString() !== user._id.toString()) {
        throw new AppError(StatusCodes.FORBIDDEN, 'Access denied for this parcel.'); 
    }

    if(user.role  === Role.RECEIVER  && parcel.receiverEmail !== user.email) {
        throw new AppError(StatusCodes.FORBIDDEN, 'Access denied to this parcel.');
    }

    return parcel;
};





 const getAllParcels = async (
  decodedUser: JwtPayload,
  allQuery: Record<string, string>
) => {
  const user = await User.findById(decodedUser.userId);

  if (!user) throw new AppError(StatusCodes.NOT_FOUND, 'User not found.');
  if (user.isActive === IsActive.BLOCKED)
    throw new AppError(StatusCodes.BAD_REQUEST, 'User is blocked.');

  const query: Record<string, any> = { isDeleted: { $ne: true } };

  // Role-based filter
  if (user.role === Role.SENDER) {
    query.senderId = user._id;
  } else if (user.role === Role.RECEIVER) {
    query.receiverEmail = user.email;
  }

  // Search feature
  if (allQuery.searchTrim) {
    const regex = new RegExp(allQuery.searchTrim, 'i');

    // sender email check from user 
    const matchedSenders = await User.find(
      { email: { $regex: regex } },
      { _id: 1 }
    );

    const senderIds = matchedSenders.map(u => u._id);

    // Apply or condition
    query.$or = [
      { trackingId: regex },
      { senderEmail: regex },
      { receiverEmail: regex },
      { 'parcelDetails.address': regex },
      { 'parcelDetails.phone': regex },
      { 'parcelDetails.note': regex },
      { currentStatus: regex },
      ...(senderIds.length > 0 ? [{ senderId: { $in: senderIds } }] : []),
    ];
  }

  // Filter by currentStatus
  if (allQuery.currentStatus) {
    query.currentStatus = allQuery.currentStatus;
  }

  // Pagination
  const page = Number(allQuery.page) || 1;
  const limit = Number(allQuery.limit) || 10;
  const skip = (page - 1) * limit;

  // Query execution
  const [data, total] = await Promise.all([
    Parcel.find(query)
      .populate('senderId', 'name email picture')
      .populate('statusHistory.updatedBy', 'role -_id')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Parcel.countDocuments(query),
  ]);

  const meta = {
    total,
    page,
    limit,
    totalPage: Math.ceil(total / limit),
  };

  return { data, meta };
};





const receiverIncomingParcels = async (decodedUser:JwtPayload, allQuery: Record<string, string>) => {
    const user = await User.findById(decodedUser.userId);

    if(!user){
        throw new AppError(StatusCodes.NOT_FOUND, 'User not found.');
    }

    if(user.role !== Role.RECEIVER) {
        throw new AppError(StatusCodes.FORBIDDEN, 'Only receivers can view incoming parcels.');
    }


   const query: Record<string, any> = {
    receiverEmail: user.email,
    currentStatus: { $nin: [ParcelStatus.CANCELLED, ParcelStatus.CONFIRMED, ParcelStatus.BLOCKED] },
    isDeleted: { $ne: true },
  };

 
  if (allQuery.searchTrim) {
    const regex = new RegExp(allQuery.searchTrim, 'i');


    const matchedSenders = await User.find({ email: { $regex: regex } }, { _id: 1 });
    const senderIds = matchedSenders.map(u => u._id);

   
    query.$or = [
      { trackingId: regex },
      { senderEmail: regex },
      { 'parcelDetails.address': regex },
      { 'parcelDetails.phone': regex },
      { 'parcelDetails.note': regex },
      { currentStatus: regex },
      ...(senderIds.length > 0 ? [{ senderId: { $in: senderIds } }] : []),
    ];
  }


  if (allQuery.currentStatus) {
    query.currentStatus = allQuery.currentStatus;
  }


  const page = Number(allQuery.page) || 1;
  const limit = Number(allQuery.limit) || 10;
  const skip = (page - 1) * limit;

 
  const [data, total] = await Promise.all([
    Parcel.find(query)
      .populate('senderId', 'name email picture')
      .populate('statusHistory.updatedBy', 'role -_id')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Parcel.countDocuments(query),
  ]);

  const meta = {
    total,
    page,
    limit,
    totalPage: Math.ceil(total / limit),
  };

 return {
    data,
    meta,
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
            throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to confirm this parcel.');
        }

        if(parcel.currentStatus === ParcelStatus.CONFIRMED){
            throw new AppError(StatusCodes.BAD_REQUEST, 'Parcel has already been confirmed by the receiver.')
        }

        
        parcel.currentStatus = ParcelStatus.CONFIRMED;
        parcel.statusHistory.push({
            status:ParcelStatus.CONFIRMED,
            updatedAt: new Date(),
            updatedBy:receiver._id,
        });

        await parcel.save({session});
        await session.commitTransaction();
        session.endSession();
        return parcel;
    } catch(error:any){
        await session.abortTransaction();
        session.endSession();
        throw new AppError(StatusCodes.FAILED_DEPENDENCY, error.message);
    }
};





const deliveryHistory = async (decodedUser:JwtPayload, allQuery:Record<string, string>) => {
    const user = await User.findById(decodedUser.userId);

    if(!user) {
        throw new AppError(StatusCodes.UNAUTHORIZED, 'User not found.');
    }
    if (user.isActive === IsActive.BLOCKED)
        throw new AppError(StatusCodes.BAD_REQUEST, 'User is blocked.');

    const query: Record<string, any> = { isDeleted: { $ne: true } };

    
    if (user.role === Role.RECEIVER) {
        query.receiverEmail = user.email;
        
       
        if (allQuery.currentStatus) {
            query.currentStatus = allQuery.currentStatus;
        } else {
            query.currentStatus = {
                $in: [ParcelStatus.DELIVERED, ParcelStatus.CONFIRMED, ParcelStatus.CANCELLED],
            };
        }
    } else if (user.role === Role.SENDER) {
        query.senderId = user._id;
        
    
        if (allQuery.currentStatus) {
            query.currentStatus = allQuery.currentStatus;
        } else {
            query.currentStatus = {
                $in: [
                    ParcelStatus.DELIVERED,
                    ParcelStatus.CONFIRMED,
                    ParcelStatus.CANCELLED,
                    ParcelStatus.APPROVED,
                    ParcelStatus.IN_TRANSIT,
                ],
            };
        }
    } else {
        throw new AppError(
            StatusCodes.FORBIDDEN,
            'Only sender or receiver can view delivery history.'
        );
    }

    // Search functionality
    if (allQuery.searchTrim) {
        const regex = new RegExp(allQuery.searchTrim, 'i');

        let senderIds: string[] = [];
        if (user.role === Role.RECEIVER) {
            const matchedSenders = await User.find({ email: { $regex: regex } }, { _id: 1 });
            senderIds = matchedSenders.map(u => u._id.toString());
        }

        query.$or = [
            { trackingId: regex },
            { senderEmail: regex },
            { 'parcelDetails.address': regex },
            { 'parcelDetails.phone': regex },
            { 'parcelDetails.note': regex },
            { currentStatus: regex },
            ...(senderIds.length > 0 ? [{ senderId: { $in: senderIds } }] : []),
        ];
    }

    const page = Number(allQuery.page) || 1;
    const limit = Number(allQuery.limit) || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        Parcel.find(query)
            .populate('senderId', 'name email picture')
            .populate('statusHistory.updatedBy', 'role -_id')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Parcel.countDocuments(query),
    ]);

    const meta = {
        total,
        page,
        limit,
        totalPage: Math.ceil(total / limit),
    };

    return {
        data, 
        meta,
    };
};




const updateParcelStatus = async (parcelId: string, payload:Partial<IParcel>, decodedUser:JwtPayload) => {
    if(decodedUser.role !== 'ADMIN') {
        throw new AppError(StatusCodes.FORBIDDEN, 'Only admin can update parcel status.');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try{
        const parcel = await Parcel.findById(parcelId).session(session);
        if(!parcel) {
            throw new AppError(StatusCodes.NOT_FOUND, 'Parcel not found.');
        }

        if(payload.currentStatus && payload.currentStatus !== parcel.currentStatus) {
            parcel.statusHistory.push({
                status:payload.currentStatus,
                updatedAt: new Date(),
                updatedBy: decodedUser.userId,
            });

            parcel.currentStatus = payload.currentStatus;
        } else {
            throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid or duplicate status.');
        }
        const updateParcel = await parcel.save({ session });
        await session.commitTransaction();
        session.endSession();

        return updateParcel;
    } catch (error:any) {
        await session.abortTransaction();
        session.endSession();
        throw new AppError(StatusCodes.FAILED_DEPENDENCY, error.message);
    }

};




const deleteParcel = async (parcelId: string, decodedUser:JwtPayload) => {
    const parcel = await Parcel.findById(parcelId);
    
    if(!parcel) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Parcel not found!');
    }

    const userId = decodedUser.userId;
    const role = decodedUser.role;

    if(role === Role.SENDER) {
        const sender = parcel.senderId.toString() === userId;
        if(!sender){
            throw new AppError(StatusCodes.FORBIDDEN, 'You are not the owner of this parcel.');
        }

        if(notAllowedStatus.includes(parcel.currentStatus)) {
            throw new AppError(StatusCodes.BAD_REQUEST, "Approved, Confirmed or Delivered parcels cannot be deleted by sender.");
        }
    }


    if(role === 'receiver'){
        throw new AppError(StatusCodes.FORBIDDEN, 'Receivers are not allowed to delete parcels.');
    }

    await Parcel.findByIdAndDelete(parcelId);
};




export const parcelService = {
    createParcel,
    getAllParcels,
    updateParcel,
    cancelParcel,
    receiverIncomingParcels,
    confirmedDelivery,
    updateParcelStatus,
    getAParcel,
    deliveryHistory,
    deleteParcel,
};