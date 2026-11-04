const createGearItem = async()=> {
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId
        }
    })
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