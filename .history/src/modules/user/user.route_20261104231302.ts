import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { userController } from "./user.controller.js";
import { auth } from "../../middlewares/auth.js";

const router = Router();

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                name: string;
                email: string;
                role: Role;
            };
        }
    }
}

router.post("/register", userController.registerUser);
router.get("/me", 
    auth(Role.ADMIN,Role.AUTHOR,Role.USER),
//     (req:Request, res:Response, next:NextFunction) => {
//     console.log(req.cookies);
//     const { accessToken } = req.cookies;
    
//          const verifiedToken = jwtUtils.verifyToken(accessToken, config.jwt_access_secret);
    
//          if(!verifiedToken.success){
//             throw new Error(verifiedToken.error)
//          }
//         //  if(typeof verifiedToken === "string"){
//         //     throw new Error(verifiedToken);
//         //  }


//          const {id, name,email,role} = verifiedToken.data as JwtPayload;

//         const requiredRoles = [Role.ADMIN, Role.AUTHOR, Role.USER];

//         if(!requiredRoles.includes(role)){
//             return res.status(403).json({
//                 success: false,
//                 statusCode: httpStatus.FORBIDDEN,
//                 message: "Forbidden: You do not have permission to access this resource",
//             });

//         }

//         req.user = {
//             id,
//             name,
//             email,
//             role
//         }

//     next();
// } , 
userController.getMyProfile );
router.put("/my-profile", auth(Role.ADMIN,Role.PROVIDER,Role.CUSTOMER), userController.updateMyProfile)


export const userRoutes = router;
