import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { reviewService } from "./review.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status";

const createReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const payload = req.body;
    const result = await reviewService.createReview(userId, payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Review submitted successfully",
        data: result
    });
});

const getGearReviews = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { gearItemId } = req.params;
    const query = req.query;
    const result = await reviewService.getGearReviews(gearItemId as string, query);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Gear reviews retrieved successfully",
        meta: result.meta,
        data: result.data
    });
});

const getMyReviews = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const query = req.query;
    const result = await reviewService.getMyReviews(userId, query);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "My reviews retrieved successfully",
        meta: result.meta,
        data: result.data
    });
});

const updateReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { reviewId } = req.params;
    const userId = req.user?.id as string;
    const payload = req.body;
    const result = await reviewService.updateReview(reviewId as string, userId, payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Review updated successfully",
        data: result
    });
});

const deleteReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { reviewId } = req.params;
    const user = req.user!;
    const result = await reviewService.deleteReview(reviewId as string, user);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Review deleted successfully",
        data: result
    });
});

export const reviewController = {
    createReview,
    getGearReviews,
    getMyReviews,
    updateReview,
    deleteReview
};

