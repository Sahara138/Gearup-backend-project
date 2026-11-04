import { GearItemWhereInput } from "../../../generated/prisma/models.js"
import { prisma } from "../../lib/prisma.js"
import { ICreateGearItemPayload, IGearItemQuery } from "./gearItem.interface.js"

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
const getAllGearItems = async(query: IGearItemQuery)=> {
        const limit = query.limit ? Number(query.limit) : 10;
        const page = query.page ? Number(query.page) : 1;
        const skip = (page -1) * limit;
        const sortBy = query.sortBy ? query.sortBy : "createdAt";
        const sortOrder = query.sortOrder ? query.sortOrder : "desc";
    
    const andConditions : GearItemWhereInput[] = [];
    if(query.searchTerm){
        andConditions.push({
            OR : [
                                {
                                    title : {
                                        contains: query.searchTerm,
                                        mode : "insensitive"
                                    },
                                    
                                },
                                {
                                    description : {
                                        contains: query.searchTerm,
                                        mode : "insensitive"
                                    }
                                }
                            ]
        })
    }

    if(query.title){
        andConditions.push({
            title : query.title
        })
    }

    if(query.description){
        andConditions.push({
            description : query.description
        })
    }

    if(query.providerId){
        andConditions.push({
            providerId : query.providerId
        })
    }
   
    if(query.categories){
        andConditions.push({
            categories : {
                hasSome : tagsArray
            }
        })
    }

    if(query.status){
        andConditions.push({
            status : query.status
        })
    }
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