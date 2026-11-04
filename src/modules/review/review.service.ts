import { Role, RentalStatus } from "../../../generated/prisma/enums.js";
import { ReviewWhereInput } from "../../../generated/prisma/models.js";
import { prisma } from "../../lib/prisma.js";
import { ICreateReviewPayload, IReviewQuery, IUpdateReviewPayload } from "./review.interface.js";

// Helper function to update aggregate rating and reviewCount on GearItem
const updateGearItemStats = async (gearItemId: string) => {
    const aggregate = await prisma.review.aggregate({
        where: { gearItemId },
        _avg: { rating: true },
        _count: { rating: true }
    });

    const averageRating = aggregate._avg.rating ? Number(aggregate._avg.rating.toFixed(1)) : 0;
    const reviewCount = aggregate._count.rating || 0;

    await prisma.gearItem.update({
        where: { id: gearItemId },
        data: {
            rating: averageRating,
            reviewCount
        }
    });
};

const createReview = async (userId: string, payload: ICreateReviewPayload) => {
    const { gearItemId, rating, comment, images } = payload;

    // Validate rating range
    if (!rating || rating < 1 || rating > 5) {
        throw new Error("Rating must be an integer between 1 and 5");
    }

    // Verify user exists and is active
    const user = await prisma.user.findUniqueOrThrow({
        where: { id: userId }
    });

    if (user.activeStatus === "SUSPEND") {
        throw new Error("Your account has been suspended. Please contact support.");
    }

    // Verify gear item exists
    await prisma.gearItem.findUniqueOrThrow({
        where: { id: gearItemId }
    });

    // Check that customer has actually rented and returned this gear item
    const hasReturnedRental = await prisma.rentalOrder.findFirst({
        where: {
            customerId: userId,
            status: RentalStatus.RETURNED,
            items: {
                some: {
                    gearItemId
                }
            }
        }
    });

    if (!hasReturnedRental) {
        throw new Error("You can only review gear items from rental orders that have been completed and returned");
    }

    // Prevent duplicate review for the same gear item by the same user
    const existingReview = await prisma.review.findFirst({
        where: {
            userId,
            gearItemId
        }
    });

    if (existingReview) {
        throw new Error("You have already submitted a review for this gear item");
    }

    const review = await prisma.review.create({
        data: {
            userId,
            gearItemId,
            rating,
            comment,
            images: images || []
        },
        include: {
            user: {
                omit: { password: true },
                include: { profile: true }
            },
            gearItem: {
                select: {
                    id: true,
                    title: true,
                    images: true
                }
            }
        }
    });

    // Recalculate gear rating and reviewCount
    await updateGearItemStats(gearItemId);

    return review;
};

const getGearReviews = async (gearItemId: string, query: IReviewQuery) => {
    const limit = query.limit ? Number(query.limit) : 10;
    const page = query.page ? Number(query.page) : 1;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";

    const andConditions: ReviewWhereInput[] = [
        { gearItemId }
    ];

    if (query.rating) {
        andConditions.push({ rating: Number(query.rating) });
    }

    const whereConditions: ReviewWhereInput = { AND: andConditions };

    const [reviews, total] = await Promise.all([
        prisma.review.findMany({
            where: whereConditions,
            take: limit,
            skip: skip,
            orderBy: {
                [sortBy]: sortOrder
            },
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
        }),
        prisma.review.count({ where: whereConditions })
    ]);

    return {
        data: reviews,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

const getMyReviews = async (userId: string, query: IReviewQuery) => {
    const limit = query.limit ? Number(query.limit) : 10;
    const page = query.page ? Number(query.page) : 1;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";

    const andConditions: ReviewWhereInput[] = [
        { userId }
    ];

    const whereConditions: ReviewWhereInput = { AND: andConditions };

    const [reviews, total] = await Promise.all([
        prisma.review.findMany({
            where: whereConditions,
            take: limit,
            skip: skip,
            orderBy: {
                [sortBy]: sortOrder
            },
            include: {
                gearItem: {
                    select: {
                        id: true,
                        title: true,
                        brand: true,
                        images: true,
                        price: true
                    }
                }
            }
        }),
        prisma.review.count({ where: whereConditions })
    ]);

    return {
        data: reviews,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

const updateReview = async (
    reviewId: string,
    userId: string,
    payload: IUpdateReviewPayload
) => {
    const review = await prisma.review.findUniqueOrThrow({
        where: { id: reviewId }
    });

    if (review.userId !== userId) {
        throw new Error("You are not authorized to update this review");
    }

    if (payload.rating && (payload.rating < 1 || payload.rating > 5)) {
        throw new Error("Rating must be between 1 and 5");
    }

    const updated = await prisma.review.update({
        where: { id: reviewId },
        data: {
            ...(payload.rating ? { rating: payload.rating } : {}),
            ...(payload.comment !== undefined ? { comment: payload.comment } : {}),
            ...(payload.images ? { images: payload.images } : {})
        },
        include: {
            user: {
                omit: { password: true },
                include: { profile: true }
            },
            gearItem: {
                select: {
                    id: true,
                    title: true,
                    images: true
                }
            }
        }
    });

    if (payload.rating) {
        await updateGearItemStats(review.gearItemId);
    }

    return updated;
};

const deleteReview = async (
    reviewId: string,
    user: { id: string; role: Role }
) => {
    const review = await prisma.review.findUniqueOrThrow({
        where: { id: reviewId }
    });

    if (user.role !== Role.ADMIN && review.userId !== user.id) {
        throw new Error("You are not authorized to delete this review");
    }

    const deleted = await prisma.review.delete({
        where: { id: reviewId }
    });

    await updateGearItemStats(review.gearItemId);

    return deleted;
};

export const reviewService = {
    createReview,
    getGearReviews,
    getMyReviews,
    updateReview,
    deleteReview
};

