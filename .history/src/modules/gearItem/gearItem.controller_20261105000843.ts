import { NextFunction, Request } from "express"
import { catchAsync } from "../../utils/catchAsync.js"

 
 const createGearItem = catchAsync(async(req:Request,res:RequestCache, next:NextFunction))
 
 export const gearItemsController = {

 }