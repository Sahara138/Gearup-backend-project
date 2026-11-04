import { GearStatus, Role } from "../../../generated/prisma/enums.js";
import { GearItemWhereInput } from "../../../generated/prisma/models.js";
import { prisma } from "../../lib/prisma.js";
import { ICreateGearItemPayload, IGearItemQuery, IUpdateGearItemPayload } from "./gearItem.interface.js";

const createGearItem = async (payload: ICreateGearItemPayload, userId: string) => {
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId
        }
    });

    if (user.activeStatus === "SUSPEND") {
        throw new Error("Your account has been suspended. Please contact support.");
    }

    const { categoryIds, ...gearData } = payload;

    const result = await prisma.gearItem.create({
        data: {
            ...gearData,
            images: gearData.images || [],
            providerId: userId,
            ...(categoryIds && categoryIds.length > 0
                ? {
                    categories: {
                        connect: categoryIds.map((id) => ({ id }))
                    }
                }
                : {})
        },
        include: {
            categories: true,
            provider: {
                omit: {
                    password: true
                },
                include: {
                    profile: true
                }
            }
        }
    });

    return result;
};

const getAllGearItems = async (query: IGearItemQuery) => {
    const limit = query.limit ? Number(query.limit) : 10;
    const page = query.page ? Number(query.page) : 1;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy ? query.sortBy : "createdAt";
    const sortOrder = query.sortOrder ? query.sortOrder : "desc";

    const andConditions: GearItemWhereInput[] = [];

    // Search term across title, description, brand
    if (query.searchTerm) {
        andConditions.push({
            OR: [
                {
                    title: {
                        contains: query.searchTerm,
                        mode: "insensitive"
                    }
                },
                {
                    description: {
                        contains: query.searchTerm,
                        mode: "insensitive"
                    }
                },
                {
                    brand: {
                        contains: query.searchTerm,
                        mode: "insensitive"
                    }
                }
            ]
        });
    }

    // Filter by title
    if (query.title) {
        andConditions.push({
            title: {
                contains: query.title,
                mode: "insensitive"
            }
        });
    }

    // Filter by description
    if (query.description) {
        andConditions.push({
            description: {
                contains: query.description,
                mode: "insensitive"
            }
        });
    }

    // Filter by brand
    if (query.brand) {
        andConditions.push({
            brand: {
                contains: query.brand,
                mode: "insensitive"
            }
        });
    }

    // Filter by specific categoryId
    if (query.categoryId) {
        andConditions.push({
            categories: {
                some: {
                    id: query.categoryId
                }
            }
        });
    }

    // Filter by category name
    if (query.category) {
        andConditions.push({
            categories: {
                some: {
                    name: {
                        contains: query.category,
                        mode: "insensitive"
                    }
                }
            }
        });
    }

    // Filter by multiple categories (JSON array string or comma separated)
    if (query.categories) {
        try {
            const parsedCategories = typeof query.categories === "string" && query.categories.startsWith("[")
                ? JSON.parse(query.categories)
                : query.categories.split(",").map((c) => c.trim());

            if (Array.isArray(parsedCategories) && parsedCategories.length > 0) {
                andConditions.push({
                    categories: {
                        some: {
                            OR: [
                                { id: { in: parsedCategories } },
                                { name: { in: parsedCategories, mode: "insensitive" } }
                            ]
                        }
                    }
                });
            }
        } catch {
            // Ignore parse errors, fallback to single match
            andConditions.push({
                categories: {
                    some: {
                        name: {
                            contains: query.categories,
                            mode: "insensitive"
                        }
                    }
                }
            });
        }
    }

    // Filter by provider
    if (query.providerId) {
        andConditions.push({
            providerId: query.providerId
        });
    }

    // Filter by price range
    if (query.minPrice || query.maxPrice) {
        andConditions.push({
            price: {
                ...(query.minPrice ? { gte: Number(query.minPrice) } : {}),
                ...(query.maxPrice ? { lte: Number(query.maxPrice) } : {})
            }
        });
    }

    // Filter by stock / availability
    if (query.availability === "true" || query.inStock === "true") {
        andConditions.push({
            stock: {
                gt: 0
            }
        });
    }

    // Filter by status (default hides REMOVED items)
    if (query.status) {
        andConditions.push({
            status: query.status
        });
    } else {
        andConditions.push({
            status: {
                not: GearStatus.REMOVED
            }
        });
    }

    const whereConditions: GearItemWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    const [gearItems, totalGearItemCount] = await Promise.all([
        prisma.gearItem.findMany({
            where: whereConditions,
            take: limit,
            skip: skip,
            orderBy: {
                [sortBy]: sortOrder
            },
            include: {
                categories: true,
                provider: {
                    omit: {
                        password: true
                    },
                    include: {
                        profile: true
                    }
                },
                reviews: {
                    select: {
                        id: true,
                        rating: true,
                        comment: true,
                        createdAt: true
                    }
                }
            }
        }),
        prisma.gearItem.count({
            where: whereConditions
        })
    ]);

    return {
        data: gearItems,
        meta: {
            page,
            limit,
            totalPages: Math.ceil(totalGearItemCount / limit),
            total: totalGearItemCount
        }
    };
};

const getGearByGearItemId = async (gearItemId: string) => {
    const gearItem = await prisma.gearItem.findUniqueOrThrow({
        where: {
            id: gearItemId
        },
        include: {
            categories: true,
            provider: {
                omit: {
                    password: true
                },
                include: {
                    profile: true
                }
            },
            reviews: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            profile: {
                                select: {
                                    profilePhoto: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    return gearItem;
};

const updateGearItems = async (
    gearItemId: string,
    payload: IUpdateGearItemPayload,
    user: { id: string; role: Role }
) => {
    const gearItem = await prisma.gearItem.findUniqueOrThrow({
        where: {
            id: gearItemId
        }
    });

    // Only provider who owns the gear or an admin can update
    if (user.role === Role.PROVIDER && gearItem.providerId !== user.id) {
        throw new Error("You are not authorized to update this gear item");
    }

    const { categoryIds, ...gearData } = payload;

    const updatedGearItem = await prisma.gearItem.update({
        where: {
            id: gearItemId
        },
        data: {
            ...gearData,
            ...(categoryIds
                ? {
                    categories: {
                        set: categoryIds.map((id) => ({ id }))
                    }
                }
                : {})
        },
        include: {
            categories: true,
            provider: {
                omit: {
                    password: true
                },
                include: {
                    profile: true
                }
            }
        }
    });

    return updatedGearItem;
};

const deleteGearItems = async (
    gearItemId: string,
    user: { id: string; role: Role }
) => {
    const gearItem = await prisma.gearItem.findUniqueOrThrow({
        where: {
            id: gearItemId
        },
        include: {
            rentalItems: {
                select: {
                    id: true
                }
            }
        }
    });

    // Only provider who owns the gear or an admin can delete
    if (user.role === Role.PROVIDER && gearItem.providerId !== user.id) {
        throw new Error("You are not authorized to delete this gear item");
    }

    // If item has associated rentals, soft-delete to preserve booking history
    if (gearItem.rentalItems.length > 0) {
        const softDeletedItem = await prisma.gearItem.update({
            where: {
                id: gearItemId
            },
            data: {
                status: GearStatus.REMOVED
            }
        });
        return softDeletedItem;
    }

    // Otherwise, safely hard delete
    const deletedItem = await prisma.gearItem.delete({
        where: {
            id: gearItemId
        }
    });

    return deletedItem;
};

const getMyGearItems = async (userId: string, query: IGearItemQuery) => {
    return getAllGearItems({
        ...query,
        providerId: userId
    });
};

export const gearItemServices = {
    createGearItem,
    getAllGearItems,
    getGearByGearItemId,
    updateGearItems,
    deleteGearItems,
    getMyGearItems
};
