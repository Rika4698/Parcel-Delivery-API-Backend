/* eslint-disable prefer-const */
import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { verifyToken } from "../utils/jwt";
import { envVars } from "../config/env";
import { User } from "../modules/user/user.model";
import { IsActive } from "../modules/user/user.interface";




export const checkAuth = (...authRole: string[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log('DEBUG: Headers:', req.headers);
        console.log('DEBUG: Cookies:', req.cookies);
        let accessToken = req.cookies.accessToken;

        if (!accessToken) {
            throw new AppError(StatusCodes.FORBIDDEN, 'No Token Received');
        }

        const decodedToken = verifyToken(accessToken, envVars.JWT_ACCESS_SECRET) as JwtPayload;
        const isUserExit = await User.findOne({ email: decodedToken.email });

        if (!isUserExit) {
            throw new AppError(StatusCodes.BAD_REQUEST, 'User does not exist');
        }
        if (isUserExit.isActive === IsActive.BLOCKED || isUserExit.isActive === IsActive.INACTIVE) {
            throw new AppError(StatusCodes.BAD_REQUEST, `User is ${isUserExit.isActive}`);
        }
        if (isUserExit.isDeleted) {
            throw new AppError(StatusCodes.BAD_REQUEST, 'User is deleted');
        }
        if (!authRole.includes(decodedToken.role)) {
            throw new AppError(403, 'You are not permitted to view this route!');
        }
        req.user = decodedToken;
        next();
    } catch (error) {
        next(error);
    }
};