import { CategoryWhereInput } from "../../../generated/prisma/models.js";
import { prisma } from "../../lib/prisma.js";
import { ICategoryQuery, ICreateCategoryPayload, IUpdateCategoryPayload } from "./category.interface.js";

const createCategory = async (payload: ICreateCategoryPayload) => {
    const isCategoryExist = await prisma.category.findUnique({
        where: {
            name: payload.name
        }
    });

    if (isCategoryExist) {
        throw new Error("Category with this name already exists");
    }

    const category = await prisma.category.create({
        data: {
            name: payload.name,
            description: payload.description
        }
    });

    return category;
};

const getAllCategories = async (query: ICategoryQuery) => {
    const limit = query.limit ? Number(query.limit) : 50;
    const page = query.page ? Number(query.page) : 1;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy ? query.sortBy : "createdAt";
    const sortOrder = query.sortOrder ? query.sortOrder : "desc";

    const andConditions: CategoryWhereInput[] = [];

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
                    description: {
                        contains: query.searchTerm,
                        mode: "insensitive"
                    }
                }
            ]
        });
    }

    const whereConditions: CategoryWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    const [categories, totalCategories] = await Promise.all([
        prisma.category.findMany({
            where: whereConditions,
            take: limit,
            skip: skip,
            orderBy: {
                [sortBy]: sortOrder
            },
            include: {
                _count: {
                    select: {
                        gearItems: true
                    }
                }
            }
        }),
        prisma.category.count({
            where: whereConditions
        })
    ]);

    return {
        data: categories,
        meta: {
            page,
            limit,
            total: totalCategories,
            totalPages: Math.ceil(totalCategories / limit)
        }
    };
};

const getCategoryById = async (categoryId: string) => {
    const category = await prisma.category.findUniqueOrThrow({
        where: {
            id: categoryId
        },
        include: {
            gearItems: {
                where: {
                    status: "ACTIVE"
                },
                take: 12,
                select: {
                    id: true,
                    title: true,
                    brand: true,
                    images: true,
                    price: true,
                    discountPrice: true,
                    rating: true,
                    reviewCount: true,
                    stock: true
                }
            },
            _count: {
                select: {
                    gearItems: true
                }
            }
        }
    });

    return category;
};

const updateCategory = async (categoryId: string, payload: IUpdateCategoryPayload) => {
    await prisma.category.findUniqueOrThrow({
        where: {
            id: categoryId
        }
    });

    if (payload.name) {
        const isNameExist = await prisma.category.findUnique({
            where: {
                name: payload.name
            }
        });

        if (isNameExist && isNameExist.id !== categoryId) {
            throw new Error("Another category with this name already exists");
        }
    }

    const updatedCategory = await prisma.category.update({
        where: {
            id: categoryId
        },
        data: payload
    });

    return updatedCategory;
};

const deleteCategory = async (categoryId: string) => {
    await prisma.category.findUniqueOrThrow({
        where: {
            id: categoryId
        }
    });

    const deletedCategory = await prisma.category.delete({
        where: {
            id: categoryId
        }
    });

    return deletedCategory;
};

export const categoryService = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};

