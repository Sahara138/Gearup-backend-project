import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { categoryService } from "./category.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status";

const createCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const result = await categoryService.createCategory(payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Category created successfully",
        data: result
    });
});

const getAllCategories = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await categoryService.getAllCategories(query);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Categories fetched successfully",
        meta: result.meta,
        data: result.data
    });
});

const getCategoryById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params;
    const result = await categoryService.getCategoryById(categoryId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Category fetched successfully",
        data: result
    });
});

const updateCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params;
    const payload = req.body;
    const result = await categoryService.updateCategory(categoryId as string, payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Category updated successfully",
        data: result
    });
});

const deleteCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params;
    const result = await categoryService.deleteCategory(categoryId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Category deleted successfully",
        data: result
    });
});

export const categoryController = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};

