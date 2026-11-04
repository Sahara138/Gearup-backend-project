import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { paymentService } from "./payment.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status";

const createPaymentSession = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const userEmail = req.user?.email as string;
    const payload = req.body;

    const result = await paymentService.createPaymentSession(userId, userEmail, payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Stripe payment session created successfully",
        data: result
    });
});

const confirmPayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Supports both query param (?sessionId=...) and body ({ sessionId })
    const sessionId = (req.query.sessionId as string) || req.body.sessionId;

    const result = await paymentService.confirmPayment(sessionId);

    sendResponse(res, {
        success: result.success,
        statusCode: httpStatus.OK,
        message: result.message,
        data: result
    });
});

const getMyPaymentHistory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const result = await paymentService.getMyPaymentHistory(userId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payment history retrieved successfully",
        data: result
    });
});

const getPaymentById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user = req.user!;
    const result = await paymentService.getPaymentById(id as string, user);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payment details retrieved successfully",
        data: result
    });
});

const cancelPaymentCallback = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    sendResponse(res, {
        success: false,
        statusCode: httpStatus.OK,
        message: "Payment was cancelled by the user. You can retry paying at any time.",
        data: null
    });
});

export const paymentController = {
    createPaymentSession,
    confirmPayment,
    getMyPaymentHistory,
    getPaymentById,
    cancelPaymentCallback
};

