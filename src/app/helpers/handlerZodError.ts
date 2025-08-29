/* eslint-disable @typescript-eslint/no-explicit-any */
import { IGenericErrorResponse, TErrorSources } from "../interfaces/error.types";



export const handleZodError = (err:any): IGenericErrorResponse => {
    const errorSources:TErrorSources[] = [];

    err.issues.forEach((issue:any) => {
        errorSources.push({
            path:issue.path[issue.path.length - 1],
            message: issue.message,
        });
    });

    return{
        statusCode:400,
        message:"Zod Error",
        errorSources,
    };
};