import { JwtPayload } from "jsonwebtoken";


declare global {
    namespace Express {
        interface Request {
            user: JwtPayload;
        }
    }
}
export interface TErrorSources {
    path: string;
    message: string;
}


export interface IGenericErrorResponse {
    statusCode: number,
    message: string,
    errorSources?: TErrorSources[]
}    
