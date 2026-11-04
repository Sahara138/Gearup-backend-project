import { NextFunction, Request, Response } from "express"
import { catchAsync } from "../../utils/catchAsync.js"

 
 const createGearItem = catchAsync(async(req:Request,res:Response, next:NextFunction)=> {
    const payload = req.body;
 }) 
 const ge = catchAsync(async(req:Request,res:Response, next:NextFunction)=> {
    const payload = req.body;
 }) const createGearItem = catchAsync(async(req:Request,res:Response, next:NextFunction)=> {
    const payload = req.body;
 }) const createGearItem = catchAsync(async(req:Request,res:Response, next:NextFunction)=> {
    const payload = req.body;
 }) const createGearItem = catchAsync(async(req:Request,res:Response, next:NextFunction)=> {
    const payload = req.body;
 }) const createGearItem = catchAsync(async(req:Request,res:Response, next:NextFunction)=> {
    const payload = req.body;
 })
 
 export const gearItemsController = {
    createGearItem,
    getAllGearItems,
    getGearByGearItemId,
    updateGearItems,
    deleteGearItems
 }