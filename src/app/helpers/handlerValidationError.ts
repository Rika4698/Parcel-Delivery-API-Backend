/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import { IGenericErrorResponse, TErrorSources } from "../interfaces/error.types";



export const handleValidationError = (err: mongoose.Error.ValidationError) : IGenericErrorResponse =>{
    const errorSources:TErrorSources[] = [];
    const  error = Object.values(err.errors);

    error.forEach((errorObject:any) =>
    errorSources.push({
        path:errorObject.path,
        message:errorObject.message,
    })
);

return{
    statusCode:400,
    message:'Validation Error',
    errorSources,
};
};