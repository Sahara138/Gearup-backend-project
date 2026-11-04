import { ActiveStatus, Role } from "../../../generated/prisma/enums.js";

export interface RegisterUserPayload {
    name: string;
    email: string;
    password: string;
    role?: Role;
    phoneNumber?: string;
    profilePhoto?: string;
    address?: string;
}

export interface IUserQuery {
    searchTerm?: string;
    role?: Role;
    activeStatus?: ActiveStatus;
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}
