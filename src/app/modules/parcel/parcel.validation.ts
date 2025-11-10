import z from "zod";
import { ParcelStatus } from "./parcel.interface";



export const createParcelZodSchema = z.object({
    receiverEmail:z
                 .string()
                 .nonempty('Receiver email is required')
                 .email('Invalid email'),
    parcelDetails:z.object({
        address:z.string().nonempty('Address is required'),
        phone:z.string().nonempty('Phone number is required'),
        weight:z.number().positive('Weight must be positive'),
        note:z.string().optional(),
    }),
    fee:z
        .number()
        .min(1, 'Fee is required'),             
});



export const updateParcelZodSchema = z.object({
    receiverEmail:z
                  .string()
                  .nonempty('Receiver email is required')
                  .email('Invalid email')
                  .optional(),
    parcelDetails:z.object({
        address:z.string().nonempty('Address is required').optional(),
        phone:z.string().nonempty('Phone number is required').optional(),
        weight:z.number().positive('Weight must be positive').optional(),
        note:z.string().optional(),
    }).optional(),
    fee:z
        .number()
        .min(1, 'Fee is required').optional(),
    
  currentStatus: z.string().optional()           
});

const ParcelStatusValues = Object.values(ParcelStatus) as [string, ...string[]];

export const updateParcelStatusZodSchema = z.object({
    currentStatus:z.enum(ParcelStatusValues).refine(val => !!val, {
        message:'currentStatus is required',
    }),
});