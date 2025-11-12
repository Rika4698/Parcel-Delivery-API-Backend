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
exports.parcelService = void 0;
const parcel_interface_1 = require("./parcel.interface");
const user_model_1 = require("../user/user.model");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = require("http-status-codes");
const user_interface_1 = require("../user/user.interface");
const parcel_model_1 = require("./parcel.model");
const mongoose_1 = __importDefault(require("mongoose"));
const constants_1 = require("../../constants");
const createParcel = (Payload, decodedUser) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const sender = yield user_model_1.User.findById(decodedUser.userId).session(session);
        if (!sender) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'User not found.');
        }
        if (sender.role !== user_interface_1.Role.SENDER) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'Only senders can create parcels.');
        }
        if (decodedUser.email === Payload.receiverEmail) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'You cannot sent parcel to you.');
        }
        if (sender.isDeleted || sender.isActive == user_interface_1.IsActive.BLOCKED) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Account is deleted or blocked.");
        }
        if (!Payload.receiverEmail) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Receiver email is required.');
        }
        // const receiver = await User.findOne({ email:Payload.receiverEmail }).session(session);
        //  if(!receiver || receiver.role !== Role.RECEIVER){
        //     throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid receiver.');
        // }
        const pay = (_a = Payload.parcelDetails) === null || _a === void 0 ? void 0 : _a.weight;
        if (!pay) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Parcel weight is required.');
        }
        const fee = Payload.fee * pay;
        const generateTrackingId = () => {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const random = Math.floor(100000 + Math.random() * 900000);
            return `TRK-${year}${month}${day}-${random}`;
        };
        const trackingId = generateTrackingId();
        const updatedPayload = yield parcel_model_1.Parcel.create([
            Object.assign(Object.assign({}, Payload), { senderId: sender._id, receiverEmail: Payload.receiverEmail, trackingId,
                fee, statusHistory: [
                    {
                        status: parcel_interface_1.ParcelStatus.PENDING,
                        updatedAt: new Date(),
                        updatedBy: sender._id,
                    },
                ] }),
        ], { session });
        sender.Parcels.push(updatedPayload[0]._id);
        yield sender.save({ session });
        yield session.commitTransaction();
        session.endSession();
        return updatedPayload[0];
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw new AppError_1.default(http_status_codes_1.StatusCodes.FAILED_DEPENDENCY, error.message);
    }
});
const updateParcel = (parcelId, payload, decodedUser) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.Parcel.findById(parcelId);
    const user = yield user_model_1.User.findById(decodedUser.userId);
    if (decodedUser.role === user_interface_1.Role.RECEIVER) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'Only sender and admin can update parcel.');
    }
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Parcel not found.');
    }
    if ((user === null || user === void 0 ? void 0 : user.isActive) === user_interface_1.IsActive.BLOCKED) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'User is blocked.');
    }
    if (parcel.senderId.toString() !== decodedUser.userId) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'You are not the sender of this parcel.');
    }
    if (payload.currentStatus) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'You are not allowed to update the parcel status.');
    }
    const { currentStatus, statusHistory } = payload, senderPayload = __rest(payload, ["currentStatus", "statusHistory"]);
    const updateFields = {};
    for (const key of Object.keys(senderPayload)) {
        if (key === 'parcelDetails' && senderPayload.parcelDetails) {
            for (const nestedKey of Object.keys(senderPayload.parcelDetails)) {
                updateFields[`parcelDetails.${nestedKey}`] = senderPayload.parcelDetails[nestedKey];
            }
        }
        else {
            updateFields[key] = senderPayload[key];
        }
    }
    const updatedParcel = yield parcel_model_1.Parcel.findByIdAndUpdate(parcelId, { $set: updateFields }, { new: true, runValidators: true });
    return updatedParcel;
});
const cancelParcel = (parcelId, decodedUser) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const parcel = yield parcel_model_1.Parcel.findById(parcelId);
        const user = yield user_model_1.User.findById(decodedUser.userId);
        if (!parcel) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Parcel not found.');
        }
        if ((user === null || user === void 0 ? void 0 : user.isActive) === user_interface_1.IsActive.BLOCKED) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'User is blocked.');
        }
        if (!user) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'User not found.');
        }
        if (parcel.senderId.toString() !== user._id.toString() || user.role !== user_interface_1.Role.SENDER) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'You are not authorized to cancel this parcel.');
        }
        if (parcel.currentStatus !== parcel_interface_1.ParcelStatus.PENDING) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Only pending parcels can be cancelled.');
        }
        parcel.currentStatus = parcel_interface_1.ParcelStatus.CANCELLED;
        parcel.statusHistory.push({
            status: parcel_interface_1.ParcelStatus.CANCELLED,
            updatedAt: new Date(),
            updatedBy: user._id,
        });
        yield parcel.save({ session });
        yield session.commitTransaction();
        session.endSession();
        return parcel;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw new AppError_1.default(http_status_codes_1.StatusCodes.FAILED_DEPENDENCY, error.message);
    }
});
const getAParcel = (parcelId, decodedUser) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(decodedUser.userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found.');
    }
    if (user.isActive === user_interface_1.IsActive.BLOCKED) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'User is blocked.');
    }
    const parcel = yield parcel_model_1.Parcel.findById(parcelId);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Parcel not found');
    }
    if (user.role === user_interface_1.Role.SENDER && parcel.senderId.toString() !== user._id.toString()) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'Access denied for this parcel.');
    }
    if (user.role === user_interface_1.Role.RECEIVER && parcel.receiverEmail !== user.email) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'Access denied to this parcel.');
    }
    return parcel;
});
const getAllParcels = (decodedUser, allQuery) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(decodedUser.userId);
    if (!user)
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found.');
    if (user.isActive === user_interface_1.IsActive.BLOCKED)
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'User is blocked.');
    const query = { isDeleted: { $ne: true } };
    // Role-based filter
    if (user.role === user_interface_1.Role.SENDER) {
        query.senderId = user._id;
    }
    else if (user.role === user_interface_1.Role.RECEIVER) {
        query.receiverEmail = user.email;
    }
    // Search feature
    if (allQuery.searchTrim) {
        const regex = new RegExp(allQuery.searchTrim, 'i');
        // sender email check from user 
        const matchedSenders = yield user_model_1.User.find({ email: { $regex: regex } }, { _id: 1 });
        const senderIds = matchedSenders.map(u => u._id);
        // Apply or condition
        query.$or = [
            { trackingId: regex },
            { senderEmail: regex },
            { receiverEmail: regex },
            { 'parcelDetails.address': regex },
            { 'parcelDetails.phone': regex },
            { 'parcelDetails.note': regex },
            { currentStatus: regex },
            ...(senderIds.length > 0 ? [{ senderId: { $in: senderIds } }] : []),
        ];
    }
    // Filter by currentStatus
    if (allQuery.currentStatus) {
        query.currentStatus = allQuery.currentStatus;
    }
    // Pagination
    const page = Number(allQuery.page) || 1;
    const limit = Number(allQuery.limit) || 10;
    const skip = (page - 1) * limit;
    // Query execution
    const [data, total] = yield Promise.all([
        parcel_model_1.Parcel.find(query)
            .populate('senderId', 'name email picture')
            .populate('statusHistory.updatedBy', 'role -_id')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        parcel_model_1.Parcel.countDocuments(query),
    ]);
    const meta = {
        total,
        page,
        limit,
        totalPage: Math.ceil(total / limit),
    };
    return { data, meta };
});
const receiverIncomingParcels = (decodedUser, allQuery) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(decodedUser.userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found.');
    }
    if (user.role !== user_interface_1.Role.RECEIVER) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'Only receivers can view incoming parcels.');
    }
    const query = {
        receiverEmail: user.email,
        currentStatus: { $nin: [parcel_interface_1.ParcelStatus.CANCELLED, parcel_interface_1.ParcelStatus.CONFIRMED, parcel_interface_1.ParcelStatus.BLOCKED] },
        isDeleted: { $ne: true },
    };
    if (allQuery.searchTrim) {
        const regex = new RegExp(allQuery.searchTrim, 'i');
        const matchedSenders = yield user_model_1.User.find({ email: { $regex: regex } }, { _id: 1 });
        const senderIds = matchedSenders.map(u => u._id);
        query.$or = [
            { trackingId: regex },
            { senderEmail: regex },
            { 'parcelDetails.address': regex },
            { 'parcelDetails.phone': regex },
            { 'parcelDetails.note': regex },
            { currentStatus: regex },
            ...(senderIds.length > 0 ? [{ senderId: { $in: senderIds } }] : []),
        ];
    }
    if (allQuery.currentStatus) {
        query.currentStatus = allQuery.currentStatus;
    }
    const page = Number(allQuery.page) || 1;
    const limit = Number(allQuery.limit) || 10;
    const skip = (page - 1) * limit;
    const [data, total] = yield Promise.all([
        parcel_model_1.Parcel.find(query)
            .populate('senderId', 'name email picture')
            .populate('statusHistory.updatedBy', 'role -_id')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        parcel_model_1.Parcel.countDocuments(query),
    ]);
    const meta = {
        total,
        page,
        limit,
        totalPage: Math.ceil(total / limit),
    };
    return {
        data,
        meta,
    };
});
const confirmedDelivery = (parcelId, decodedUser) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const receiver = yield user_model_1.User.findById(decodedUser.userId).session(session);
        if (!receiver) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found.');
        }
        if (receiver.role !== user_interface_1.Role.RECEIVER) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'Only receivers can confirm delivery.');
        }
        const parcel = yield parcel_model_1.Parcel.findById(parcelId).session(session);
        if (!parcel) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Parcel not found.');
        }
        if (parcel.receiverEmail.toString() !== receiver.email.toString()) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'You are not authorized to confirm this parcel.');
        }
        if (parcel.currentStatus === parcel_interface_1.ParcelStatus.CONFIRMED) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Parcel has already been confirmed by the receiver.');
        }
        parcel.currentStatus = parcel_interface_1.ParcelStatus.CONFIRMED;
        parcel.statusHistory.push({
            status: parcel_interface_1.ParcelStatus.CONFIRMED,
            updatedAt: new Date(),
            updatedBy: receiver._id,
        });
        yield parcel.save({ session });
        yield session.commitTransaction();
        session.endSession();
        return parcel;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw new AppError_1.default(http_status_codes_1.StatusCodes.FAILED_DEPENDENCY, error.message);
    }
});
const deliveryHistory = (decodedUser, allQuery) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(decodedUser.userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'User not found.');
    }
    if (user.isActive === user_interface_1.IsActive.BLOCKED)
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'User is blocked.');
    const query = { isDeleted: { $ne: true } };
    if (user.role === user_interface_1.Role.RECEIVER) {
        query.receiverEmail = user.email;
        if (allQuery.currentStatus) {
            query.currentStatus = allQuery.currentStatus;
        }
        else {
            query.currentStatus = {
                $in: [parcel_interface_1.ParcelStatus.DELIVERED, parcel_interface_1.ParcelStatus.CONFIRMED, parcel_interface_1.ParcelStatus.CANCELLED],
            };
        }
    }
    else if (user.role === user_interface_1.Role.SENDER) {
        query.senderId = user._id;
        if (allQuery.currentStatus) {
            query.currentStatus = allQuery.currentStatus;
        }
        else {
            query.currentStatus = {
                $in: [
                    parcel_interface_1.ParcelStatus.DELIVERED,
                    parcel_interface_1.ParcelStatus.CONFIRMED,
                    parcel_interface_1.ParcelStatus.CANCELLED,
                    parcel_interface_1.ParcelStatus.APPROVED,
                    parcel_interface_1.ParcelStatus.IN_TRANSIT,
                ],
            };
        }
    }
    else {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'Only sender or receiver can view delivery history.');
    }
    // Search functionality
    if (allQuery.searchTrim) {
        const regex = new RegExp(allQuery.searchTrim, 'i');
        let senderIds = [];
        if (user.role === user_interface_1.Role.RECEIVER) {
            const matchedSenders = yield user_model_1.User.find({ email: { $regex: regex } }, { _id: 1 });
            senderIds = matchedSenders.map(u => u._id.toString());
        }
        query.$or = [
            { trackingId: regex },
            { senderEmail: regex },
            { 'parcelDetails.address': regex },
            { 'parcelDetails.phone': regex },
            { 'parcelDetails.note': regex },
            { currentStatus: regex },
            ...(senderIds.length > 0 ? [{ senderId: { $in: senderIds } }] : []),
        ];
    }
    const page = Number(allQuery.page) || 1;
    const limit = Number(allQuery.limit) || 10;
    const skip = (page - 1) * limit;
    const [data, total] = yield Promise.all([
        parcel_model_1.Parcel.find(query)
            .populate('senderId', 'name email picture')
            .populate('statusHistory.updatedBy', 'role -_id')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        parcel_model_1.Parcel.countDocuments(query),
    ]);
    const meta = {
        total,
        page,
        limit,
        totalPage: Math.ceil(total / limit),
    };
    return {
        data,
        meta,
    };
});
const updateParcelStatus = (parcelId, payload, decodedUser) => __awaiter(void 0, void 0, void 0, function* () {
    if (decodedUser.role !== 'ADMIN') {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'Only admin can update parcel status.');
    }
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const parcel = yield parcel_model_1.Parcel.findById(parcelId).session(session);
        if (!parcel) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Parcel not found.');
        }
        if (payload.currentStatus && payload.currentStatus !== parcel.currentStatus) {
            parcel.statusHistory.push({
                status: payload.currentStatus,
                updatedAt: new Date(),
                updatedBy: decodedUser.userId,
            });
            parcel.currentStatus = payload.currentStatus;
        }
        else {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid or duplicate status.');
        }
        const updateParcel = yield parcel.save({ session });
        yield session.commitTransaction();
        session.endSession();
        return updateParcel;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw new AppError_1.default(http_status_codes_1.StatusCodes.FAILED_DEPENDENCY, error.message);
    }
});
const deleteParcel = (parcelId, decodedUser) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.Parcel.findById(parcelId);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Parcel not found!');
    }
    const userId = decodedUser.userId;
    const role = decodedUser.role;
    if (role === user_interface_1.Role.SENDER) {
        const sender = parcel.senderId.toString() === userId;
        if (!sender) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'You are not the owner of this parcel.');
        }
        if (constants_1.notAllowedStatus.includes(parcel.currentStatus)) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Approved, Confirmed or Delivered parcels cannot be deleted by sender.");
        }
    }
    if (role === 'receiver') {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'Receivers are not allowed to delete parcels.');
    }
    yield parcel_model_1.Parcel.findByIdAndDelete(parcelId);
});
exports.parcelService = {
    createParcel,
    getAllParcels,
    updateParcel,
    cancelParcel,
    receiverIncomingParcels,
    confirmedDelivery,
    updateParcelStatus,
    getAParcel,
    deliveryHistory,
    deleteParcel,
};
