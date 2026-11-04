import { Role, RentalStatus, GearStatus } from "../../../generated/prisma/enums.js";
import { RentalOrderWhereInput } from "../../../generated/prisma/models.js";
import { prisma } from "../../lib/prisma.js";
import { ICreateRentalOrderPayload, IRentalOrderQuery, IUpdateRentalOrderStatusPayload } from "./rentalOrder.interface.js";

const createRentalOrder = async (customerId: string, payload: ICreateRentalOrderPayload) => {
    // 1. Verify user exists and is not suspended
    const customer = await prisma.user.findUniqueOrThrow({
        where: { id: customerId }
    });

    if (customer.activeStatus === "SUSPEND") {
        throw new Error("Your account has been suspended. Please contact support.");
    }

    // 2. Validate dates
    const start = new Date(payload.startDate);
    const end = new Date(payload.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error("Invalid start or end date format");
    }

    if (end <= start) {
        throw new Error("End date must be after start date");
    }

    const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    // 3. Validate items
    if (!payload.items || payload.items.length === 0) {
        throw new Error("Please select at least one gear item to rent");
    }

    // 4. Fetch gear items and verify availability
    const gearItemIds = payload.items.map((i) => i.gearItemId);
    const gearItems = await prisma.gearItem.findMany({
        where: {
            id: { in: gearItemIds }
        }
    });

    if (gearItems.length !== gearItemIds.length) {
        throw new Error("One or more selected gear items were not found");
    }

    const gearMap = new Map(gearItems.map((g) => [g.id, g]));

    // Check stock & status, calculate subtotals
    let calculatedTotal = 0;
    const orderItemsData: {
        gearItemId: string;
        quantity: number;
        unitPrice: number;
        subtotal: number;
    }[] = [];

    for (const item of payload.items) {
        if (!item.quantity || item.quantity <= 0) {
            throw new Error("Quantity must be greater than zero");
        }

        const gear = gearMap.get(item.gearItemId);
        if (!gear) {
            throw new Error(`Gear item ${item.gearItemId} not found`);
        }

        if (gear.status !== GearStatus.ACTIVE) {
            throw new Error(`Gear item "${gear.title}" is currently not available for rental`);
        }

        if (gear.stock < item.quantity) {
            throw new Error(`Insufficient stock for "${gear.title}". Available stock: ${gear.stock}`);
        }

        const pricePerDay = Number(gear.discountPrice || gear.price);
        const itemSubtotal = pricePerDay * diffDays * item.quantity;
        calculatedTotal += itemSubtotal;

        orderItemsData.push({
            gearItemId: item.gearItemId,
            quantity: item.quantity,
            unitPrice: pricePerDay,
            subtotal: itemSubtotal
        });
    }

    // 5. Execute transaction: create order, items, and decrement gear stock
    const createdOrder = await prisma.$transaction(async (tx) => {
        // Create rental order
        const order = await tx.rentalOrder.create({
            data: {
                customerId,
                startDate: start,
                endDate: end,
                totalAmount: calculatedTotal,
                status: RentalStatus.PLACED,
                items: {
                    create: orderItemsData
                }
            },
            include: {
                items: {
                    include: {
                        gearItem: true
                    }
                },
                customer: {
                    omit: {
                        password: true
                    },
                    include: {
                        profile: true
                    }
                }
            }
        });

        // Decrement gear stock
        for (const item of payload.items) {
            await tx.gearItem.update({
                where: { id: item.gearItemId },
                data: {
                    stock: {
                        decrement: item.quantity
                    }
                }
            });
        }

        return order;
    });

    return createdOrder;
};

const getMyRentalOrders = async (customerId: string, query: IRentalOrderQuery) => {
    const limit = query.limit ? Number(query.limit) : 10;
    const page = query.page ? Number(query.page) : 1;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";

    const andConditions: RentalOrderWhereInput[] = [
        { customerId }
    ];

    if (query.status) {
        andConditions.push({ status: query.status });
    }

    const whereConditions: RentalOrderWhereInput = { AND: andConditions };

    const [orders, total] = await Promise.all([
        prisma.rentalOrder.findMany({
            where: whereConditions,
            take: limit,
            skip: skip,
            orderBy: {
                [sortBy]: sortOrder
            },
            include: {
                items: {
                    include: {
                        gearItem: {
                            include: {
                                provider: {
                                    omit: { password: true }
                                }
                            }
                        }
                    }
                },
                payments: true
            }
        }),
        prisma.rentalOrder.count({ where: whereConditions })
    ]);

    return {
        data: orders,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

const getRentalOrderById = async (
    orderId: string,
    user: { id: string; role: Role }
) => {
    const order = await prisma.rentalOrder.findUniqueOrThrow({
        where: { id: orderId },
        include: {
            items: {
                include: {
                    gearItem: {
                        include: {
                            provider: {
                                omit: { password: true },
                                include: { profile: true }
                            }
                        }
                    }
                }
            },
            customer: {
                omit: { password: true },
                include: { profile: true }
            },
            payments: true
        }
    });

    // Permission check
    const isCustomerOwner = order.customerId === user.id;
    const isProviderOfAnItem = order.items.some(
        (item) => item.gearItem.providerId === user.id
    );
    const isAdmin = user.role === Role.ADMIN;

    if (!isCustomerOwner && !isProviderOfAnItem && !isAdmin) {
        throw new Error("You are not authorized to view this rental order");
    }

    return order;
};

const getProviderIncomingOrders = async (
    providerId: string,
    query: IRentalOrderQuery
) => {
    const limit = query.limit ? Number(query.limit) : 10;
    const page = query.page ? Number(query.page) : 1;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";

    const andConditions: RentalOrderWhereInput[] = [
        {
            items: {
                some: {
                    gearItem: {
                        providerId
                    }
                }
            }
        }
    ];

    if (query.status) {
        andConditions.push({ status: query.status });
    }

    const whereConditions: RentalOrderWhereInput = { AND: andConditions };

    const [orders, total] = await Promise.all([
        prisma.rentalOrder.findMany({
            where: whereConditions,
            take: limit,
            skip: skip,
            orderBy: {
                [sortBy]: sortOrder
            },
            include: {
                items: {
                    include: {
                        gearItem: true
                    }
                },
                customer: {
                    omit: { password: true },
                    include: { profile: true }
                },
                payments: true
            }
        }),
        prisma.rentalOrder.count({ where: whereConditions })
    ]);

    return {
        data: orders,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

const updateRentalOrderStatus = async (
    orderId: string,
    payload: IUpdateRentalOrderStatusPayload,
    user: { id: string; role: Role }
) => {
    const order = await prisma.rentalOrder.findUniqueOrThrow({
        where: { id: orderId },
        include: {
            items: {
                include: {
                    gearItem: true
                }
            }
        }
    });

    // Verify permission: Provider of items or Admin
    if (user.role === Role.PROVIDER) {
        const isProviderOfAnItem = order.items.some(
            (item) => item.gearItem.providerId === user.id
        );
        if (!isProviderOfAnItem) {
            throw new Error("You are not authorized to update this rental order");
        }
    }

    const targetStatus = payload.status;

    // Execute state change in transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
        // If order is cancelled or items returned, restore inventory stock
        if (
            (targetStatus === RentalStatus.CANCELLED || targetStatus === RentalStatus.RETURNED) &&
            order.status !== RentalStatus.CANCELLED &&
            order.status !== RentalStatus.RETURNED
        ) {
            for (const item of order.items) {
                await tx.gearItem.update({
                    where: { id: item.gearItemId },
                    data: {
                        stock: {
                            increment: item.quantity
                        }
                    }
                });
            }
        }

        const result = await tx.rentalOrder.update({
            where: { id: orderId },
            data: { status: targetStatus },
            include: {
                items: {
                    include: {
                        gearItem: true
                    }
                },
                customer: {
                    omit: { password: true }
                },
                payments: true
            }
        });

        return result;
    });

    return updatedOrder;
};

const cancelRentalOrder = async (orderId: string, customerId: string) => {
    const order = await prisma.rentalOrder.findUniqueOrThrow({
        where: { id: orderId },
        include: {
            items: true
        }
    });

    if (order.customerId !== customerId) {
        throw new Error("You are not authorized to cancel this rental order");
    }

    if (order.status !== RentalStatus.PLACED && order.status !== RentalStatus.CONFIRMED) {
        throw new Error(`Cannot cancel an order with status "${order.status}"`);
    }

    const cancelledOrder = await prisma.$transaction(async (tx) => {
        // Restock inventory
        for (const item of order.items) {
            await tx.gearItem.update({
                where: { id: item.gearItemId },
                data: {
                    stock: {
                        increment: item.quantity
                    }
                }
            });
        }

        return tx.rentalOrder.update({
            where: { id: orderId },
            data: {
                status: RentalStatus.CANCELLED
            },
            include: {
                items: true,
                payments: true
            }
        });
    });

    return cancelledOrder;
};

const getAllRentalOrdersForAdmin = async (query: IRentalOrderQuery) => {
    const limit = query.limit ? Number(query.limit) : 10;
    const page = query.page ? Number(query.page) : 1;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";

    const andConditions: RentalOrderWhereInput[] = [];

    if (query.status) {
        andConditions.push({ status: query.status });
    }

    if (query.customerId) {
        andConditions.push({ customerId: query.customerId });
    }

    if (query.providerId) {
        andConditions.push({
            items: {
                some: {
                    gearItem: {
                        providerId: query.providerId
                    }
                }
            }
        });
    }

    const whereConditions: RentalOrderWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    const [orders, total] = await Promise.all([
        prisma.rentalOrder.findMany({
            where: whereConditions,
            take: limit,
            skip: skip,
            orderBy: {
                [sortBy]: sortOrder
            },
            include: {
                items: {
                    include: {
                        gearItem: {
                            include: {
                                provider: {
                                    omit: { password: true }
                                }
                            }
                        }
                    }
                },
                customer: {
                    omit: { password: true },
                    include: { profile: true }
                },
                payments: true
            }
        }),
        prisma.rentalOrder.count({ where: whereConditions })
    ]);

    return {
        data: orders,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

export const rentalOrderService = {
    createRentalOrder,
    getMyRentalOrders,
    getRentalOrderById,
    getProviderIncomingOrders,
    updateRentalOrderStatus,
    cancelRentalOrder,
    getAllRentalOrdersForAdmin
};

