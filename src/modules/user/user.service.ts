import { prisma } from "../../lib/prisma.js";
import bcrypt from "bcryptjs";
import config from "../../config/index.js";
import { IUserQuery, RegisterUserPayload } from "./user.interface.js";
import { ActiveStatus, Role } from "../../../generated/prisma/enums.js";
import { UserWhereInput } from "../../../generated/prisma/models.js";

const registerUserIntoDB = async (payload: RegisterUserPayload) => {
    const { email, name, password, role, profilePhoto, phoneNumber, address } = payload;

    const isUserExist = await prisma.user.findUnique({
        where: {
            email: email
        }
    });

    if (isUserExist) {
        throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds || 10));

    const createdUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: role || Role.CUSTOMER,
            profile: {
                create: {
                    profilePhoto,
                    phoneNumber,
                    address
                }
            }
        }
    });

    const user = await prisma.user.findUnique({
        where: {
            id: createdUser.id,
            email: createdUser.email
        },
        omit: {
            password: true
        },
        include: {
            profile: true
        }
    });
    return user;
};

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
};

const updateMyProfileIntoDB = async (userId: string, payload: any) => {
    const { name, email, profilePhoto, phoneNumber, address } = payload;

    const updatedUser = await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            name,
            email,
            profile: {
                upsert: {
                    create: {
                        profilePhoto,
                        phoneNumber,
                        address
                    },
                    update: {
                        profilePhoto,
                        phoneNumber,
                        address
                    }
                }
            }
        },
        omit: {
            password: true
        },
        include: {
            profile: true
        }
    });
    return updatedUser;
};

const getAllUsersFromDB = async (query: IUserQuery) => {
    const limit = query.limit ? Number(query.limit) : 10;
    const page = query.page ? Number(query.page) : 1;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";

    const andConditions: UserWhereInput[] = [];

    if (query.searchTerm) {
        andConditions.push({
            OR: [
                {
                    name: {
                        contains: query.searchTerm,
                        mode: "insensitive"
                    }
                },
                {
                    email: {
                        contains: query.searchTerm,
                        mode: "insensitive"
                    }
                }
            ]
        });
    }

    if (query.role) {
        andConditions.push({ role: query.role });
    }

    if (query.activeStatus) {
        andConditions.push({ activeStatus: query.activeStatus });
    }

    const whereConditions: UserWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where: whereConditions,
            take: limit,
            skip: skip,
            orderBy: {
                [sortBy]: sortOrder
            },
            omit: {
                password: true
            },
            include: {
                profile: true
            }
        }),
        prisma.user.count({ where: whereConditions })
    ]);

    return {
        data: users,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

const updateUserStatusInDB = async (userId: string, activeStatus: ActiveStatus) => {
    await prisma.user.findUniqueOrThrow({
        where: { id: userId }
    });

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { activeStatus },
        omit: { password: true },
        include: { profile: true }
    });

    return updatedUser;
};

export const userService = {
    registerUserIntoDB,
    getMyProfileFromDB,
    updateMyProfileIntoDB,
    getAllUsersFromDB,
    updateUserStatusInDB
};
