import { GearStatus } from "../../../generated/prisma/enums.js";
import { GearItemWhereInput } from "../../../generated/prisma/models.js";

export interface ICreateGearItemPayload {
    title: string;
    description: string;

    brand?: string;
    images: string[];
    specifications?: Record<string, any>;

    price: number;
    discountPrice?: number;

    rating?: number;
    stock?: number;

    providerId: string;
    categoryIds?: string[];
}

export interface IUpdateGearItemPayload {
    title?: string;
    description?: string;

    brand?: string;
    images?: string[];
    specifications?: Record<string, any>;

    price?: number;
    discountPrice?: number;

    rating?: number;
    stock?: number;
    status?: GearStatus;

    categoryIds?: string[];
}

export interface IGearItemQuery extends GearItemWhereInput {
    searchTerm?: string;

    title?: string;
    description?: string;
    brand?: string;

    categoryId?: string;
    providerId?: string;
    status?: GearStatus;

    minPrice?: string;
    maxPrice?: string;

    limit?: string;
    sortOrder?: "asc" | "desc";
    sortBy?: string;
    page?: string;
}