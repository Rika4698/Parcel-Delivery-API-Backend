"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userServices = void 0;
const http_status_codes_1 = require("http-status-codes");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const user_interface_1 = require("./user.interface");
const user_model_1 = require("./user.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_1 = require("../../config/env");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const cloudinary_config_1 = require("../../config/cloudinary.config");
const constants_1 = require("../../constants");
const createUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, name, role } = payload;
    const isUserExit = yield user_model_1.User.findOne({ email });
    if (isUserExit) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'User Already Exist');
    }
    const isHashPassword = yield bcryptjs_1.default.hash(password, env_1.envVars.BCRYPT_SALT_ROUND);
    const authProvider = {
        provider: 'Email',
        providerId: email,
    };
    const userPayload = {
        email,
        password: isHashPassword,
        auths: [authProvider],
        name,
        role,
    };
    // console.log("User payload before create:", userPayload);
    const user = yield user_model_1.User.create(userPayload);
    return user;
});
const updateUser = (userId, payload, decodedUser) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExit = yield user_model_1.User.findById(userId);
    if (!isUserExit) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User Not Found');
    }
    if (decodedUser.role) {
        if (decodedUser.role === user_interface_1.Role.SENDER || decodedUser.role === user_interface_1.Role.RECEIVER) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'You are not authorized');
        }
        if (decodedUser.role !== user_interface_1.Role.ADMIN) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'You are not authorized');
        }
        if (payload.password) {
            if (decodedUser.role !== user_interface_1.Role.ADMIN) {
                throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'Only admin can update password');
            }
            const hashedPassword = yield bcryptjs_1.default.hash(payload.password, env_1.envVars.BCRYPT_SALT_ROUND);
            payload.password = hashedPassword;
        }
        if (payload.picture && isUserExit.picture) {
            yield (0, cloudinary_config_1.deleteImageFromCLoudinary)(isUserExit.picture);
        }
        const newUpdatedUser = yield user_model_1.User.findByIdAndUpdate(userId, payload, {
            new: true,
            runValidators: true,
        });
        return newUpdatedUser;
    }
});
const updateUserProfile = (userId, payload, decodedUser) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExist = yield user_model_1.User.findById(userId);
    if (!isUserExist) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User Not Found');
    }
    if (isUserExist.role !== decodedUser.role) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "You are not authorized");
    }
    if (payload.password) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'You are not allowed to update password here!');
    }
    if (payload.role === 'ADMIN') {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'You cannot Update your role into admin. Only admins can update user roles.');
    }
    const newUpdatedProfile = yield user_model_1.User.findByIdAndUpdate(userId, payload, {
        new: true,
        runValidators: true,
    });
    return newUpdatedProfile;
});
const getAllUser = (decodedUser, query) => __awaiter(void 0, void 0, void 0, function* () {
    const adminUser = yield user_model_1.User.findById(decodedUser.userId);
    if (!adminUser || adminUser.role !== user_interface_1.Role.ADMIN) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'Only admin can access all users.');
    }
    const users = user_model_1.User.find({ role: { $in: [user_interface_1.Role.RECEIVER, user_interface_1.Role.SENDER] }, });
    const queryBuilder = new QueryBuilder_1.QueryBuilder(users, query);
    const allUser = queryBuilder.search(constants_1.userSearchableFields).filter().paginate();
    const [data, meta] = yield Promise.all([
        allUser.build().exec(),
        queryBuilder.getMeta(),
    ]);
    return {
        data,
        meta
    };
});
exports.userServices = {
    createUser,
    getAllUser,
    updateUser,
    updateUserProfile,
};
