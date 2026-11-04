import { prisma } from "../../lib/prisma.js"
import { ICreateGearItemPayload } from "./gearItem.interface.js"

const createGearItem = async(payload: ICreateGearItemPayload,userId: string)=> {
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId
        }
    })
    
    const result = await prisma.gearItem.create({
        data: {
            ...payload,
            providerId: userId,
        }
    })
    return result;
}
const getAllGearItems = async(query)=> {
        const limit = query.limit ? Number(query.limit) : 10;
    const page = query.page ? Number(query.page) : 1;
    const skip = (page -1) * limit;
    const sortBy = query.sortBy ? query.sortBy : "createdAt";
    const sortOrder = query.sortOrder ? query.sortOrder : "desc";
    
}
const getGearByGearItemId = async()=> {
    
}
const updateGearItems = async()=> {
    
}
const deleteGearItems = async()=> {
    
}

export const gearItemServices = {
    createGearItem,
    getAllGearItems,
    getGearByGearItemId,
    updateGearItems,
    deleteGearItems
}