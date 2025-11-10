import { Response } from "express";




interface authTokenInfo {
    accessToken?:string;
    refreshToken?:string;
}

export const setAuthCookie = (res:Response, tokenInfo:authTokenInfo) => {
    const isProduction = process.env.NODE_ENV === "production";
    if (tokenInfo.accessToken) {
  res.cookie("accessToken", tokenInfo.accessToken, {
    httpOnly: true,
    secure: isProduction,    
    sameSite: isProduction ? "none" : "lax", 
  });
}

if (tokenInfo.refreshToken) {
  res.cookie("refreshToken", tokenInfo.refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
}

}