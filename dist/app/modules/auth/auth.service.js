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
exports.authServices = void 0;
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_codes_1 = require("http-status-codes");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const createTokens_1 = require("../../utils/createTokens");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../user/user.model");
const user_interface_1 = require("../user/user.interface");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_1 = require("../../config/env");
const sendMail_1 = require("../../utils/sendMail");
const getNewAccessToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    if (!refreshToken) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'No RefreshToken Received');
    }
    const accessToken = yield (0, createTokens_1.createAccessTokenWithRefreshToken)(refreshToken);
    return {
        accessToken: accessToken,
    };
});
const changePassword = (oldPassword, newPassword, decodedUser) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(decodedUser.userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'User Not Found');
    }
    if (user.isDeleted && user.isActive === user_interface_1.IsActive.BLOCKED) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'User is Blocked or Deleted');
    }
    const isOldPassword = yield bcryptjs_1.default.compare(oldPassword, user === null || user === void 0 ? void 0 : user.password);
    if (!isOldPassword) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Old Password does not match');
    }
    user.password = yield bcryptjs_1.default.hash(newPassword, env_1.envVars.BCRYPT_SALT_ROUND);
    yield user.save();
});
const setPassword = (password, decodedUser) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(decodedUser.userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "User not found");
    }
    if (user.password && user.auths[0].provider !== 'Email') {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'User already has a password');
    }
    const hashedPassword = yield bcryptjs_1.default.hash(password, env_1.envVars.BCRYPT_SALT_ROUND);
    const credentialsProvider = {
        provider: 'email',
        providerId: user.email,
    };
    const auths = [...user.auths, credentialsProvider];
    user.password = hashedPassword;
    user.isActive = user_interface_1.IsActive.ACTIVE;
    user.auths = auths;
    yield user.save();
    return {
        user: user.toObject(),
    };
});
const forgotPassword = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExit = yield user_model_1.User.findOne({ email });
    if (!isUserExit) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User does not exist");
    }
    if (!isUserExit.isVerified) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User is not verified");
    }
    if (isUserExit.isActive === user_interface_1.IsActive.BLOCKED || isUserExit.isActive === user_interface_1.IsActive.INACTIVE) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, `User is ${isUserExit.isActive}`);
    }
    if (isUserExit.isDeleted) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'User is deleted');
    }
    const JwtPayload = {
        userId: isUserExit._id,
        email: isUserExit.email,
        role: isUserExit.role,
    };
    const resetToken = jsonwebtoken_1.default.sign(JwtPayload, env_1.envVars.JWT_ACCESS_SECRET, { expiresIn: "10m" });
    const sendingLink = `${env_1.envVars.FRONTEND_URL}/reset-password?id=${isUserExit._id}&token=${resetToken}`;
    (0, sendMail_1.sendEmail)({
        to: isUserExit.email,
        subject: "Password Reset Request",
        templateName: "forgetPassword",
        templateData: {
            name: isUserExit.name,
            sendingLink: sendingLink
        }
    });
});
const resetPassword = (payload, decodedUser) => __awaiter(void 0, void 0, void 0, function* () {
    if (payload.id !== decodedUser.userId) {
        throw new AppError_1.default(401, 'You can not reset your password');
    }
    const isUserExist = yield user_model_1.User.findById(decodedUser.userId);
    if (!isUserExist) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User does not exist");
    }
    const isHashPassword = yield bcryptjs_1.default.hash(payload.newPassword, env_1.envVars.BCRYPT_SALT_ROUND);
    isUserExist.password = isHashPassword;
    isUserExist.isActive = user_interface_1.IsActive.ACTIVE;
    yield isUserExist.save();
});
const getMe = (decodedUser) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(decodedUser.userId).select('-password')
        .populate({
        path: 'Parcels',
        select: 'tracking fee receiverEmail statusHistory currentStatus parcelDetails'
    });
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found');
    }
    return user;
});
exports.authServices = {
    getNewAccessToken,
    changePassword,
    setPassword,
    forgotPassword,
    resetPassword,
    getMe,
};
