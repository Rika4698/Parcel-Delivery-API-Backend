/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { JwtPayload } from "jsonwebtoken";
import { statsService } from "./stats.service";
import {sendResponse} from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";



const getParcelsStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedUser = req.user;

   const parcelStats =  await statsService.getParcelsStats(decodedUser as JwtPayload);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Parcel Delete Successfully!',
      data: parcelStats,
    });
  }
);





export const statsController = {
  getParcelsStats,
 
};