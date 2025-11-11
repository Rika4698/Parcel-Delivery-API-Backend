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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const passport_1 = __importDefault(require("passport"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = require("http-status-codes");
const createTokens_1 = require("../../utils/createTokens");
const setCookie_1 = require("../../utils/setCookie");
const sendResponse_1 = require("../../utils/sendResponse");
const env_1 = require("../../config/env");
const auth_service_1 = require("./auth.service");
const userLogin = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    passport_1.default.authenticate('local', (err, user, info) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            console.log(err);
            return next(err);
        }
        if (!user) {
            return next(new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, (info === null || info === void 0 ? void 0 : info.message) || 'Email is not registered.'));
        }
        const tokenInfo = yield (0, createTokens_1.createUserTokens)(user);
        const _a = user.toObject(), { password: past } = _a, rest = __rest(_a, ["password"]);
        (0, setCookie_1.setAuthCookie)(res, tokenInfo);
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_codes_1.StatusCodes.OK,
            success: true,
            message: 'User Login Successfully',
            data: Object.assign({ accessToken: tokenInfo.accessToken, refreshToken: tokenInfo.refreshToken }, rest),
        });
    }))(req, res, next);
}));
const getNewAccessToken = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies.refreshToken;
    const loginInfo = yield auth_service_1.authServices.getNewAccessToken(refreshToken);
    (0, setCookie_1.setAuthCookie)(res, loginInfo);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "User Login Successfully!",
        data: loginInfo,
    });
}));
const changePassword = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const decodedUser = req.user;
    yield auth_service_1.authServices.changePassword(oldPassword, newPassword, decodedUser);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Password Changed Successfully!",
        data: null,
    });
}));
const setPassword = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedUser = req.user;
    const password = req.body.password;
    yield auth_service_1.authServices.setPassword(password, decodedUser);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Password Changed Successfully!',
        data: null,
    });
}));
const forgotPassword = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    yield auth_service_1.authServices.forgotPassword(email);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Email Send Successfully!',
        data: null,
    });
}));
const resetPassword = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedUser = req.user;
    yield auth_service_1.authServices.resetPassword(req.body, decodedUser);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Password Changed Successfully!',
        data: null,
    });
}));
const getMe = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedUser = req.user;
    const user = yield auth_service_1.authServices.getMe(decodedUser);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Your profile retrieved successfully!',
        data: user,
    });
}));
const googleCallbackController = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let redirectTo = req.query.state ? req.query.state : '';
    if (redirectTo.startsWith('/')) {
        redirectTo = redirectTo.slice(1);
    }
    const user = req.user;
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User Not Found');
    }
    const tokenInfo = yield (0, createTokens_1.createUserTokens)(user);
    (0, setCookie_1.setAuthCookie)(res, tokenInfo);
    res.redirect(`${env_1.envVars.FRONTEND_URL}/${redirectTo}`);
}));
const logout = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const isProduction = env_1.envVars.NODE_ENV === 'production';
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
    });
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
    });
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'User LogOut Successfully!',
        data: null,
    });
}));
exports.AuthController = {
    userLogin,
    getNewAccessToken,
    logout,
    resetPassword,
    googleCallbackController,
    changePassword,
    setPassword,
    forgotPassword,
    getMe,
};
