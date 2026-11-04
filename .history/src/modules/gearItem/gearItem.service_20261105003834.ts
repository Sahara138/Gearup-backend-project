import { prisma } from "../../lib/prisma.js"
import { ICreateGearItemPayload } from "./gearItem.interface.js"

const createGearItem = async(payload: ICreateGearItemPayload,userId: string)=> {
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId
        }
    })
    
    const result = await prisma.gearItem.create
}
const getAllGearItems = async()=> {
    
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