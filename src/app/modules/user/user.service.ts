import {StatusCodes} from 'http-status-codes';
import AppError from "../../errorHelpers/AppError";
import { IsAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import bcryptjs from 'bcryptjs';
import { envVars } from '../../config/env';
import { JwtPayload } from 'jsonwebtoken';



const createUser = async(payload:Partial<IUser>)=>{
    const {email, password, name} = payload;
    const isUserExit = await User.findOne({email});

    if(isUserExit){
        throw new AppError(StatusCodes.BAD_REQUEST, 'User Already Exist');
    }

    const isHashPassword = await bcryptjs.hash(
        password as string,
        envVars.BCRYPT_SALT_ROUND
    );

    const authProvider:IsAuthProvider = {
        provider:'Email',
        providerId:email as string,
    };

    const userPayload = {
        email,
        password:isHashPassword,
        auths:[authProvider],
        name,
    };

    const user = await User.create(userPayload);
    return user;

    
};

const updateUser = async (userId:string,payload:Partial<IUser>,decodedUser: JwtPayload) => {
    const isUserExit = await User.findById(userId);

    if(!isUserExit){
        throw new AppError(StatusCodes.NOT_FOUND, 'User Not Found');
    }

    if(decodedUser.role){
        if(decodedUser.role === Role.SENDER || decodedUser.role === Role.RECEIVER){
            throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized');
        }
        if(decodedUser.role !== Role.ADMIN){
            throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized');
        }
        if(payload.password){
            if(decodedUser.role !== Role.ADMIN){
                throw new AppError(StatusCodes.FORBIDDEN, 'Only admin can update password');
            }
            const hashedPassword = await bcryptjs.hash(payload.password, envVars.BCRYPT_SALT_ROUND);
            payload.password = hashedPassword;
        }
        const newUpdatedUser = await User.findByIdAndUpdate(userId, payload,{
            new:true,
            runValidators:true,
        });
        return newUpdatedUser;
    }
};


const getAllUser = async () => {
    
    const users = await User.find({})
    const totalUser = await User.countDocuments()
    return{
        data:users,
        meta:{
            total: totalUser
        }
    }
}

export const userServices = {
    createUser,
    getAllUser,
    updateUser
}