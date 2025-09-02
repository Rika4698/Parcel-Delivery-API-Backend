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
exports.parcelController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const parcel_service_1 = require("./parcel.service");
const sendResponse_1 = require("../../utils/sendResponse");
const http_status_codes_1 = require("http-status-codes");
const parcel_model_1 = require("./parcel.model");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const createParcel = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedUser = req.user;
    const parcel = yield parcel_service_1.parcelService.createParcel(req.body, decodedUser);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: "Parcel created successfully!",
        data: parcel
    });
}));
const updateParcel = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedUser = req.user;
    const updatedParcel = yield parcel_service_1.parcelService.updateParcel(req.params.id, req.body, decodedUser);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Parcel updated successfully!',
        data: updatedParcel
    });
}));
const cancelParcel = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedUser = req.user;
    const parcelId = req.params.id;
    yield parcel_service_1.parcelService.cancelParcel(parcelId, decodedUser);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Parcel delivery canceled successfully!',
        data: null,
    });
}));
const getAllParcels = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedUser = req.user;
    const query = req.query;
    const allParcel = yield parcel_service_1.parcelService.getAllParcels(decodedUser, query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Parcels received successfully!',
        data: allParcel,
    });
}));
const getAParcel = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedUser = req.user;
    const Parcel = yield parcel_service_1.parcelService.getAParcel(req.params.id, decodedUser);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Parcel received successfully!',
        data: Parcel,
    });
}));
const receiverIncomingParcels = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedUser = req.user;
    const incomingParcel = yield parcel_service_1.parcelService.receiverIncomingParcels(decodedUser);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Incoming parcels received successfully!',
        data: incomingParcel,
    });
}));
const confirmedDelivery = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedUser = req.user;
    yield parcel_service_1.parcelService.confirmedDelivery(req.params.id, decodedUser);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Parcel confirm successfully!',
        data: null,
    });
}));
const deliveryHistory = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedUser = req.user;
    const history = yield parcel_service_1.parcelService.deliveryHistory(decodedUser);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Delivery history received successfully!',
        data: history,
    });
}));
const updateParcelStatus = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedUser = req.user;
    const updateStatus = yield parcel_service_1.parcelService.updateParcelStatus(req.params.id, req.body, decodedUser);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Parcel status update successfully!',
        data: updateStatus,
    });
}));
const trackParcel = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.Parcel.findOne({
        trackingId: req.params.trackingId,
    }).select('currentStatus parcelDetails  fee  -_id');
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Parcel not found with this tracking Id!');
    }
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Parcel received successfully!',
        data: parcel,
    });
}));
const deleteParcel = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedUser = req.user;
    yield parcel_service_1.parcelService.deleteParcel(req.params.id, decodedUser);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Parcel deleted successfully!',
        data: null,
    });
}));
exports.parcelController = {
    createParcel,
    updateParcel,
    cancelParcel,
    getAllParcels,
    receiverIncomingParcels,
    confirmedDelivery,
    updateParcelStatus,
    getAParcel,
    deliveryHistory,
    trackParcel,
    deleteParcel,
};
