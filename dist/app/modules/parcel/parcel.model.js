"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parcel = void 0;
const mongoose_1 = require("mongoose");
const parcel_interface_1 = require("./parcel.interface");
const mongoose_2 = require("mongoose");
const statusHistorySchema = new mongoose_1.Schema({
    status: {
        type: String,
        enum: Object.values(parcel_interface_1.ParcelStatus),
        default: parcel_interface_1.ParcelStatus.PENDING,
        required: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    _id: false,
    versionKey: false
});
const parcelSchema = new mongoose_1.Schema({
    trackingId: {
        type: String,
        required: true,
        unique: true,
    },
    senderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    receiverEmail: {
        type: String,
        required: true,
    },
    parcelDetails: {
        address: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        weight: {
            type: Number,
            required: true,
        },
        note: String,
    },
    fee: {
        type: Number,
        required: true,
    },
    currentStatus: {
        type: String,
        enum: Object.values(parcel_interface_1.ParcelStatus),
        default: parcel_interface_1.ParcelStatus.PENDING,
    },
    statusHistory: {
        type: [statusHistorySchema],
        default: [],
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
exports.Parcel = (0, mongoose_2.model)('Parcel', parcelSchema);
