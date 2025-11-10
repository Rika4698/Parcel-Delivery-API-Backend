"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateParcelStatusZodSchema = exports.updateParcelZodSchema = exports.createParcelZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const parcel_interface_1 = require("./parcel.interface");
exports.createParcelZodSchema = zod_1.default.object({
    receiverEmail: zod_1.default
        .string()
        .nonempty('Receiver email is required')
        .email('Invalid email'),
    parcelDetails: zod_1.default.object({
        address: zod_1.default.string().nonempty('Address is required'),
        phone: zod_1.default.string().nonempty('Phone number is required'),
        weight: zod_1.default.number().positive('Weight must be positive'),
        note: zod_1.default.string().optional(),
    }),
    fee: zod_1.default
        .number()
        .min(1, 'Fee is required'),
});
exports.updateParcelZodSchema = zod_1.default.object({
    receiverEmail: zod_1.default
        .string()
        .nonempty('Receiver email is required')
        .email('Invalid email')
        .optional(),
    parcelDetails: zod_1.default.object({
        address: zod_1.default.string().nonempty('Address is required').optional(),
        phone: zod_1.default.string().nonempty('Phone number is required').optional(),
        weight: zod_1.default.number().positive('Weight must be positive').optional(),
        note: zod_1.default.string().optional(),
    }).optional(),
    fee: zod_1.default
        .number()
        .min(1, 'Fee is required').optional(),
    currentStatus: zod_1.default.string().optional()
});
const ParcelStatusValues = Object.values(parcel_interface_1.ParcelStatus);
exports.updateParcelStatusZodSchema = zod_1.default.object({
    currentStatus: zod_1.default.enum(ParcelStatusValues).refine(val => !!val, {
        message: 'currentStatus is required',
    }),
});
