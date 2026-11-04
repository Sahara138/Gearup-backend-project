export interface ICreateCategoryPayload {
    name: string;
    description?: string;
}

export interface IUpdateCategoryPayload {
    name?: string;
    description?: string;
}

export interface ICategoryQuery {
    searchTerm?: string;
    limit?: string;
    page?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

