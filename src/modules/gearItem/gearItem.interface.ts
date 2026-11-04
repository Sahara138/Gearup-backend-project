import { GearStatus } from "../../../generated/prisma/enums.js";

export interface ICreateGearItemPayload {
    title: string;
    description: string;

    brand?: string;
    images?: string[];
    specifications?: Record<string, any>;

    price: number;
    discountPrice?: number;

    rating?: number;
    stock?: number;

    providerId?: string;
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

export interface IGearItemQuery {
    searchTerm?: string;

    title?: string;
    description?: string;
    brand?: string;

    categoryId?: string;
    category?: string;
    categories?: string;
    providerId?: string;
    status?: GearStatus;

    minPrice?: string;
    maxPrice?: string;

    availability?: string;
    inStock?: string;

    limit?: string;
    sortOrder?: "asc" | "desc";
    sortBy?: string;
    page?: string;
}
