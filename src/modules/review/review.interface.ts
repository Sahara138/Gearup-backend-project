export interface ICreateReviewPayload {
    gearItemId: string;
    rating: number; // 1 to 5
    comment?: string;
    images?: string[];
}

export interface IUpdateReviewPayload {
    rating?: number;
    comment?: string;
    images?: string[];
}

export interface IReviewQuery {
    gearItemId?: string;
    userId?: string;
    rating?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

