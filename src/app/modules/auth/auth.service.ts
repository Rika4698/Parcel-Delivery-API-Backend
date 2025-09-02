/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes"
import AppError from "../../errorHelpers/AppError"
import { createAccessTokenWithRefreshToken } from "../../utils/createTokens";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../user/user.model";
import { IsActive, IsAuthProvider } from "../user/user.interface";
import bcryptjs from 'bcryptjs';
import { envVars } from "../../config/env";
import { sendEmail } from "../../utils/sendMail";



const getNewAccessToken = async(refreshToken:string) => {
    if(!refreshToken){
        throw new AppError(StatusCodes.NOT_FOUND, 'No RefreshToken Received');
        
    }
    const accessToken = await createAccessTokenWithRefreshToken(refreshToken);
    return{
        accessToken:accessToken,
    };
};


const changePassword = async(oldPassword:string, newPassword:string, decodedUser:JwtPayload) => {
    const user = await User.findById(decodedUser.userId);

    if(!user) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'User Not Found');
    }

    if(user.isDeleted && user.isActive === IsActive.BLOCKED){
        throw new AppError(StatusCodes.BAD_REQUEST, 'User is Blocked or Deleted');
    }

    const isOldPassword = await bcryptjs.compare(
        oldPassword,
        user?.password as string
    );

    if(!isOldPassword){
        throw new AppError(StatusCodes.UNAUTHORIZED, 'Old Password does not match');
    }

    user!.password = await bcryptjs.hash(newPassword, envVars.BCRYPT_SALT_ROUND);

    await user!.save();
};


const setPassword = async (password: string, decodedUser:JwtPayload) => {
    const user = await User.findById(decodedUser.userId);

    if(!user){
        throw new AppError(StatusCodes.NOT_FOUND, "User not found");
    }
    if (user.password && user.auths[0].provider !== 'Email') {
        throw new AppError(StatusCodes.BAD_REQUEST, 'User already has a password');
    }
    const hashedPassword = await bcryptjs.hash(password, envVars.BCRYPT_SALT_ROUND);

    const credentialsProvider: IsAuthProvider = {
        provider:'email',
        providerId: user.email,
    };

    const auths: IsAuthProvider[] = [...user.auths, credentialsProvider];
    user.password = hashedPassword;
    user.isActive = IsActive.ACTIVE;
    user.auths = auths;


    await user.save();
    return{
        user:user.toObject(),
    };
    
};




const forgotPassword = async(email:string) => {
    const isUserExit = await User.findOne({email});

    if(!isUserExit){
        throw new AppError(StatusCodes.BAD_REQUEST, "User does not exist");
    }
    if(!isUserExit.isVerified){
        throw new AppError(StatusCodes.BAD_REQUEST, "User is not verified");
    }
    if(isUserExit.isActive === IsActive.BLOCKED || isUserExit.isActive === IsActive.INACTIVE){
        throw new AppError(StatusCodes.BAD_REQUEST, `User is ${isUserExit.isActive}`);
    }

    if(isUserExit.isDeleted){
        throw new AppError(StatusCodes.BAD_REQUEST, 'User is deleted');
    }

    const JwtPayload = {
        userId: isUserExit._id,
        email: isUserExit.email,
        role:isUserExit.role,
    };

    const resetToken = jwt.sign(JwtPayload, envVars.JWT_ACCESS_SECRET, {expiresIn: "10m"})

    const sendingLink = `${envVars.FRONTEND_URL}/reset-password?id=${isUserExit._id}&token=${resetToken}`

    sendEmail({
        to: isUserExit.email,
        subject:"Password Reset Request",
        templateName:"forgetPassword",
        templateData:{
            name: isUserExit.name,
            sendingLink:sendingLink
        }
    })
};




const resetPassword = async(payload: Record<string, any>, decodedUser:JwtPayload) => {
    if(payload.id !== decodedUser.userId){
        throw new AppError(401, 'You can not reset your password');
    }

    const isUserExist = await User.findById(decodedUser.userId);

    if(!isUserExist){
        throw new AppError(StatusCodes.BAD_REQUEST, "User does not exist")
    }

    const isHashPassword = await bcryptjs.hash(payload.newPassword, envVars.BCRYPT_SALT_ROUND)

    isUserExist.password = isHashPassword;
    isUserExist.isActive = IsActive.ACTIVE;

    await isUserExist.save()
};




const getMe = async (decodedUser:JwtPayload) => {
    const user = await User.findById(decodedUser.userId).select('-password')
    .populate({
        path:'Parcels',
        select:'tracking fee receiverEmail statusHistory currentStatus parcelDetails'
    });
    if(!user){
        throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
    }
    return user;
}



export const authServices = {
    getNewAccessToken,
    changePassword,
    setPassword,
    forgotPassword,
    resetPassword,
    getMe,
}