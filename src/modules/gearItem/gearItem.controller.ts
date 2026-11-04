import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { gearItemServices } from "./gearItem.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status";
import { DbNull } from "../../../generated/prisma/internal/prismaNamespace.js";

const createGearItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const payload = req.body;
    const result = await gearItemServices.createGearItem(payload, userId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Gear item added successfully",
        data: result
    });
});

const getAllGearItems = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await gearItemServices.getAllGearItems(query);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Gear items fetched successfully",
        meta: result.meta,
        data: result.data
    });
});

const getGearByGearItemId = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { gearItemId } = req.params;
    const result = await gearItemServices.getGearByGearItemId(gearItemId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Gear item details fetched successfully",
        data: result
    });
});

const updateGearItems = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { gearItemId } = req.params;
    const payload = req.body;
    const user = req.user!;
    const result = await gearItemServices.updateGearItems(gearItemId as string, payload, user);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Gear item updated successfully",
        data: result
    });
});

const deleteGearItems = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { gearItemId } = req.params;
    const user = req.user!;
    await gearItemServices.deleteGearItems(gearItemId as string, user);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Gear item deleted successfully",
        data: null
    });
});

const getMyGearItems = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const query = req.query;
    const result = await gearItemServices.getMyGearItems(userId, query);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "My gear items fetched successfully",
        meta: result.meta,
        data: result.data
    });
});

export const gearItemsController = {
    createGearItem,
    getAllGearItems,
    getGearByGearItemId,
    updateGearItems,
    deleteGearItems,
    getMyGearItems
};
