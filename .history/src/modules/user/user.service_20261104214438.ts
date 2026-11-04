import { NextFunction, Request, Response } from "express";

import httpStatus from "http-status";
import { userService } from "./user.service.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import config from "../../config/index.js";
import jwt from "jsonwebtoken";
import { jwtUtils } from "../../utils/jwt.js";


 const registerUser = catchAsync(async(req:Request, res:Response, next:NextFunction) => {
     const payload = req.body;

        const user = await userService.registerUserIntoDB(payload);

        sendResponse(res, {
            success: true,
            statusCode : httpStatus.CREATED,
            message: "User registered successfully",
            data: {
                user
            }
        });

 })

const getMyProfile = catchAsync(async(req:Request, res:Response, next:NextFunction) => {


    //  const verifiedToken = jwtUtils.verifyToken(accessToken, config.jwt_access_secret);

    //  if(typeof verifiedToken === "string"){
    //     throw new Error(verifiedToken);
    //  }

     const profile = await userService.getMyProfileFromDB(req.user?.id as string);


     sendResponse(res, {
        success: true,
        statusCode : httpStatus.OK,
        message: "User profile fetched successfully",
        data: {
            profile
        }
    });
 })

 const updateMyProfile = catchAsync(async(req:Request, res:Response, next:NextFunction) => {
    //  const { accessToken } = req.cookies;
   const userId = req.user?.id as string;

   const payload = req.body;

   const updatedProfile = await userService.updateMyProfileIntoDB(userId,payload)

    sendResponse(res, {
        success: true,
        statusCode : httpStatus.OK,
        message: "User profile updated successfully",
        data: {
            updatedProfile
        }
    });
 })

export const userController = { registerUser, getMyProfile,updateMyProfile };