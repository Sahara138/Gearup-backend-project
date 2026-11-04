import { RentalStatus } from "../../../generated/prisma/enums.js";

export interface IRentalOrderItemInput {
    gearItemId: string;
    quantity: number;
}

export interface ICreateRentalOrderPayload {
    startDate: string; // ISO format: YYYY-MM-DD
    endDate: string;   // ISO format: YYYY-MM-DD
    items: IRentalOrderItemInput[];
}

export interface IUpdateRentalOrderStatusPayload {
    status: RentalStatus;
}

export interface IRentalOrderQuery {
    status?: RentalStatus;
    startDate?: string;
    endDate?: string;
    customerId?: string;
    providerId?: string;
    limit?: string;
    page?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

