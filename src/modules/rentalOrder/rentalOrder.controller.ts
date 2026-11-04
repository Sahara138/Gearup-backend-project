import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { rentalOrderService } from "./rentalOrder.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status";

const createRentalOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id as string;
    const payload = req.body;
    const result = await rentalOrderService.createRentalOrder(customerId, payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Rental order placed successfully",
        data: result
    });
});

const getMyRentalOrders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id as string;
    const query = req.query;
    const result = await rentalOrderService.getMyRentalOrders(customerId, query);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental orders retrieved successfully",
        meta: result.meta,
        data: result.data
    });
});

const getRentalOrderById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user = req.user!;
    const result = await rentalOrderService.getRentalOrderById(id as string, user);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental order details retrieved successfully",
        data: result
    });
});

const getProviderIncomingOrders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id as string;
    const query = req.query;
    const result = await rentalOrderService.getProviderIncomingOrders(providerId, query);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Incoming rental orders retrieved successfully",
        meta: result.meta,
        data: result.data
    });
});

const updateRentalOrderStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const payload = req.body;
    const user = req.user!;
    const result = await rentalOrderService.updateRentalOrderStatus(id as string, payload, user);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental order status updated successfully",
        data: result
    });
});

const cancelRentalOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const customerId = req.user?.id as string;
    const result = await rentalOrderService.cancelRentalOrder(id as string, customerId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental order cancelled successfully",
        data: result
    });
});

const getAllRentalOrdersForAdmin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await rentalOrderService.getAllRentalOrdersForAdmin(query);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "All rental orders retrieved successfully",
        meta: result.meta,
        data: result.data
    });
});

export const rentalOrderController = {
    createRentalOrder,
    getMyRentalOrders,
    getRentalOrderById,
    getProviderIncomingOrders,
    updateRentalOrderStatus,
    cancelRentalOrder,
    getAllRentalOrdersForAdmin
};

