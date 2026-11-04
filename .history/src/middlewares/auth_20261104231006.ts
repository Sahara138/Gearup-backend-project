import { NextFunction, Request,Response,  } from "express";
import { jwtUtils } from "../utils/jwt.js";
import config from "../config/index.js";
import { Role } from "../../generated/prisma/client.js";
import httpStatus from "http-status";
import { catchAsync } from "../utils/catchAsync.js";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

//auth(Role.ADMIN,Role.AUTHOR, Role.USER)
//auth() => ...requiredRoles => [Role.ADMIN,Role.AUTHOR, Role.USER]
export const auth = (...requiredRoles: Role[]) => {
    return catchAsync(async(req:Request, res:Response, next:NextFunction) => {
        const token = req.cookies.accessToken 
            ?
            req.cookies.accessToken
            :
            req.headers.authorization?.startsWith("Bearer ") 
                ? req.headers.authorization?.split(" ")[1] 
                : req.headers.authorization;


        if(!token){
            throw new Error("You are not logged in.Please log in access this resource")
        }

        const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);
    
         if(!verifiedToken.success){
            throw new Error(verifiedToken.error)
         }

         const {id, name,email,role} = verifiedToken.data as JwtPayload;

         if(requiredRoles.length && !requiredRoles.includes(role)){
            throw new Error("Forbidden: You do not have permission to access this resource")
         }

         const user = await prisma.user.findUnique({
            where:{
                id,
                name,
                email,
                role
            }
         })

         if(!user){
            throw new Error("User not found.Please log in again.")
         }

         if(user.activeStatus === "BLOCKED"){
            throw new Error("Your account has been blocked. Please contact support.")
         }
         req.user = {
            id,
            name,
            email,
            role
         }

         next();


    })
}