import { envVars } from "../config/env"
import { IsAuthProvider, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model"
import bcryptjs from 'bcryptjs';



export const createAdmin = async() =>{
    try{
        const isAdminExist = await User.findOne({
            email:envVars.ADMIN_EMAIL,
        });

        if(isAdminExist){
            console.log('Admin Already Exists!');
            return;
        }
        const isHashPassword = await bcryptjs.hash(envVars.ADMIN_PASSWORD, envVars.BCRYPT_SALT_ROUND);

        const authProvider:IsAuthProvider = {
            provider:'Email',
            providerId:envVars.ADMIN_EMAIL,

        };
        const payload = {
            name:envVars.ADMIN_NAME,
            role:Role.ADMIN,
            email:envVars.ADMIN_EMAIL,
            address:'Dhaka',
            phone:'+8801723784534',
            password:isHashPassword,
            isVerified:true,
            auths:[authProvider],
        };
        await User.create(payload);

    } catch(error){
        console.log(error);
    }
};