import { prisma } from "../../lib/prisma.js";
import bcrypt from "bcryptjs";
import config from "../../config/index.js";
import { RegisterUserPayload } from "./user.interface.js";

const registerUserIntoDB = async (payload: RegisterUserPayload) => {
    const { email, name, password , profilePhoto, bio} = payload;

   const isUserExist = await prisma.user.findUnique({
        where: {
            email:email
        }
    });

    if(isUserExist){
        throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));

    const createdUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            profile: {
                create: {
                    profilePhoto,
                    phoneNumber,
                    address
                }
            }
        }
    })

    const user = await prisma.user.findUnique({
        where: {
            id: createdUser.id,
            email: createdUser.email
        },
        //hide the password and include the profile in the response
        omit: {
            password: true
        },
        include: {
            profile: true
        }
    })
    return user;
}

const getMyProfileFromDB = async (userId: string) => {
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId
        },
        omit: {
            password: true
        },
        include: {
            profile: true
        }
    });
    return user;
}

const updateMyProfileIntoDB = async (userId:string, payload:any) => {
    const {name,email,profilePhoto,bio} = payload;

    const updatedUser = await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            name,
            email,
            profile: {
                update: {
                    profilePhoto,
                    bio
                }
            }
        },
        omit: {
            password:true
        },
        include:{
            profile:true
        }
    })
    return updatedUser;
}

export const userService = { registerUserIntoDB, getMyProfileFromDB, updateMyProfileIntoDB };