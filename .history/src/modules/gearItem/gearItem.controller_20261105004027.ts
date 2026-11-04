import { NextFunction, Request, Response } from "express"
import { catchAsync } from "../../utils/catchAsync.js"
import { prisma } from "../../lib/prisma.js"

 
 const createGearItem = catchAsync(async(req:Request,res:Response, next:NextFunction)=> {
    const id = req.user?.id
    const payload = 
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