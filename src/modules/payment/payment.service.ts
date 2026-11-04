import { Role, PaymentStatus, RentalStatus } from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { stripe } from "../../lib/stripe.js";
import config from "../../config/index.js";
import { ICreatePaymentPayload } from "./payment.interface.js";

interface IConfirmPaymentResult {
    success: boolean;
    status: string;
    message: string;
    sessionId: string;
    rentalOrderId?: string;
}

const createPaymentSession = async (
    userId: string,
    userEmail: string,
    payload: ICreatePaymentPayload
) => {
    // 1. Fetch the rental order with items
    const rentalOrder = await prisma.rentalOrder.findUniqueOrThrow({
        where: { id: payload.rentalOrderId },
        include: {
            items: {
                include: {
                    gearItem: true
                }
            }
        }
    });

    // 2. Authorization: only the customer who placed the order can pay
    if (rentalOrder.customerId !== userId) {
        throw new Error("You are not authorized to pay for this rental order");
    }

    // 3. Status checks
    if (
        rentalOrder.status === RentalStatus.PAID ||
        rentalOrder.status === RentalStatus.PICKED_UP ||
        rentalOrder.status === RentalStatus.RETURNED
    ) {
        throw new Error("This rental order has already been paid for");
    }

    if (rentalOrder.status === RentalStatus.CANCELLED) {
        throw new Error("Cannot pay for a cancelled rental order");
    }

    // 4. Base URL for redirect URLs
    const baseUrl = config.app_url;

    // 5. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: userEmail,
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: `GearUp Rental Order #${rentalOrder.id.slice(0, 8)}`,
                        description: `Rental from ${rentalOrder.startDate.toISOString().split("T")[0]} to ${rentalOrder.endDate.toISOString().split("T")[0]}`
                    },
                    unit_amount: Math.round(Number(rentalOrder.totalAmount) * 100) // Stripe expects amount in cents
                },
                quantity: 1
            }
        ],
        metadata: {
            rentalOrderId: rentalOrder.id,
            customerId: userId
        },
        success_url: `${baseUrl}/api/payments/confirm?sessionId={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/api/payments/cancel`
    });

    // 6. Record the pending payment in the database
    const payment = await prisma.payment.create({
        data: {
            rentalOrderId: rentalOrder.id,
            transactionId: session.id,
            amount: rentalOrder.totalAmount,
            provider: "stripe",
            status: PaymentStatus.PENDING
        }
    });

    return {
        paymentUrl: session.url,
        sessionId: session.id,
        paymentId: payment.id,
        amount: rentalOrder.totalAmount
    };
};

const confirmPayment = async (sessionId: string): Promise<IConfirmPaymentResult> => {
    if (!sessionId) {
        throw new Error("sessionId is required to confirm payment");
    }

    // 1. Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // 2. Check if payment was successful
    if (session.payment_status === "paid") {
        const rentalOrderId = session.metadata?.rentalOrderId;

        // Update payment record to COMPLETED
        await prisma.payment.updateMany({
            where: {
                transactionId: sessionId
            },
            data: {
                status: PaymentStatus.COMPLETED,
                paidAt: new Date()
            }
        });

        // Update rental order status to PAID
        if (rentalOrderId) {
            await prisma.rentalOrder.update({
                where: { id: rentalOrderId },
                data: { status: RentalStatus.PAID }
            });
        }

        return {
            success: true,
            status: "PAID",
            message: "Payment successfully verified and order marked as PAID",
            sessionId,
            rentalOrderId
        };
    }

    return {
        success: false,
        status: String(session.payment_status),
        message: `Payment is not completed yet (status: ${session.payment_status})`,
        sessionId
    };
};

const getMyPaymentHistory = async (userId: string) => {
    const payments = await prisma.payment.findMany({
        where: {
            rentalOrder: {
                customerId: userId
            }
        },
        include: {
            rentalOrder: {
                include: {
                    items: {
                        include: {
                            gearItem: {
                                select: {
                                    id: true,
                                    title: true,
                                    images: true,
                                    brand: true
                                }
                            }
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    return payments;
};

const getPaymentById = async (
    paymentId: string,
    user: { id: string; role: Role }
) => {
    const payment = await prisma.payment.findUniqueOrThrow({
        where: { id: paymentId },
        include: {
            rentalOrder: {
                include: {
                    customer: {
                        omit: { password: true },
                        include: { profile: true }
                    },
                    items: {
                        include: {
                            gearItem: true
                        }
                    }
                }
            }
        }
    });

    // Only the customer who owns the order or an Admin can view payment details
    if (
        user.role !== Role.ADMIN &&
        payment.rentalOrder.customerId !== user.id
    ) {
        throw new Error("You are not authorized to view this payment details");
    }

    return payment;
};

export const paymentService = {
    createPaymentSession,
    confirmPayment,
    getMyPaymentHistory,
    getPaymentById
};
