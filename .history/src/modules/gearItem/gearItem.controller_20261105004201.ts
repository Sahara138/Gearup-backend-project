import { NextFunction, Request, Response } from "express"
import { catchAsync } from "../../utils/catchAsync.js"
import { prisma } from "../../lib/prisma.js"
import { gearItemServices } from "./gearItem.service.js"
import { sendResponse } from "../../utils/sendResponse.js"



 
 const createGearItem = catchAsync(async(req:Request,res:Response, next:NextFunction)=> {
    const id = req.user?.id
    const payload = req.body
    const result = await gearItemServices.createGearItem(payload,id as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Post Created successfully",
        data: result

    });
 }) 

 const getAllGearItems = catchAsync(async(req:Request,res:Response, next:NextFunction)=> {
    const payload = req.body;
 }) 
 
 const getGearByGearItemId = catchAsync(async(req:Request,res:Response, next:NextFunction)=> {
    const payload = req.body;
 }) 
 
 const updateGearItems = catchAsync(async(req:Request,res:Response, next:NextFunction)=> {
    const payload = req.body;
 }) 

 
 const deleteGearItems = catchAsync(async(req:Request,res:Response, next:NextFunction)=> {
    const payload = req.body;
 })
 
 export const gearItemsController = {
    createGearItem,
    getAllGearItems,
    getGearByGearItemId,
    updateGearItems,
    deleteGearItems
 }