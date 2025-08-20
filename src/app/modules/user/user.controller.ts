/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { userServices } from "./user.service";
import { StatusCodes } from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";



const createUser = catchAsync(
    async (req:Request, res:Response, next:NextFunction) => {
        const user = await userServices.createUser(req.body);
        sendResponse(res, {
            statusCode:StatusCodes.CREATED,
            success:true,
            message:'User Created Successfully',
            data:user,
            
        });
    }
);

const updateUser = catchAsync(
    async(req:Request, res:Response, next:NextFunction) => {
        const userId = req.params.id;
        const payload = req. body;
        const decodedToken = req.user;
        const user = await userServices.updateUser(userId,payload,decodedToken as JwtPayload);
        sendResponse(res, {
            success:true,
            statusCode:StatusCodes.OK,
            message:'User Updated Successfully!',
            data:user,
        });
    }
);

const getAllUser = catchAsync(async (req:Request, res:Response, next:NextFunction) => {
   
    const result = await userServices.getAllUser();
    sendResponse (res, {
        success:true,
        statusCode:StatusCodes.OK,
        message:'All Users Retrieved Successfully',
        meta:result.meta,
        data:result.data,
    });
}
);
export const userController = {
    createUser,
    getAllUser,
    updateUser
}