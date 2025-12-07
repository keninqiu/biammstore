import prisma from '@/lib/db'
import { clearCart } from './cart-service'

export async function createOrder(userId: string, addressId?: string) {
    // Get cart items
    const cart = await prisma.cartItem.findMany({
        where: { userId },
        include: { product: true },
    })

    if (cart.length === 0) {
        throw new Error('Cart is empty')
    }

    // Check stock availability
    for (const item of cart) {
        if (item.product.stock < item.quantity) {
            throw new Error(`Insufficient stock for ${item.product.name}`)
        }
    }

    // Calculate total
    const totalUSD = cart.reduce(
        (sum, item) => sum + item.product.priceUSD * item.quantity,
        0
    )

    // Create order
    const order = await prisma.order.create({
        data: {
            userId,
            addressId,
            status: 'PENDING_PAYMENT',
            totalUSD,
            currency: 'USD', // Will be updated when payment created
            cryptoAmount: 0,
            items: {
                create: cart.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    priceUSD: item.product.priceUSD,
                })),
            },
        },
        include: {
            items: {
                include: {
                    product: {
                        include: {
                            vendor: true,
                        },
                    },
                },
            },
            address: true,
        },
    })

    // Decrease product stock
    for (const item of cart) {
        await prisma.product.update({
            where: { id: item.productId },
            data: {
                stock: {
                    decrement: item.quantity,
                },
            },
        })
    }

    // Clear cart
    await clearCart(userId)

    return order
}

export async function getOrderById(id: string) {
    return prisma.order.findUnique({
        where: { id },
        include: {
            items: {
                include: {
                    product: {
                        include: {
                            images: {
                                take: 1,
                            },
                            vendor: {
                                select: {
                                    storeName: true,
                                },
                            },
                        },
                    },
                },
            },
            payment: {
                include: {
                    transactions: true,
                },
            },
            address: true,
            user: {
                select: {
                    email: true,
                    name: true,
                },
            },
        },
    })
}

export async function getUserOrders(userId: string) {
    return prisma.order.findMany({
        where: { userId },
        include: {
            items: {
                include: {
                    product: {
                        include: {
                            images: {
                                take: 1,
                            },
                        },
                    },
                },
            },
            payment: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    })
}

export async function getVendorOrders(vendorId: string) {
    return prisma.order.findMany({
        where: {
            items: {
                some: {
                    product: {
                        vendorId,
                    },
                },
            },
        },
        include: {
            items: {
                where: {
                    product: {
                        vendorId,
                    },
                },
                include: {
                    product: true,
                },
            },
            user: {
                select: {
                    name: true,
                    email: true,
                },
            },
            address: true,
            payment: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    })
}

export async function updateOrderStatus(
    id: string,
    status:
        | 'PENDING_PAYMENT'
        | 'PAYMENT_CONFIRMING'
        | 'PAID'
        | 'PROCESSING'
        | 'SHIPPED'
        | 'DELIVERED'
        | 'CANCELLED'
        | 'REFUNDED'
) {
    return prisma.order.update({
        where: { id },
        data: { status },
    })
}

export async function cancelOrder(id: string) {
    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            items: true,
        },
    })

    if (!order) {
        throw new Error('Order not found')
    }

    if (!['PENDING_PAYMENT', 'PAYMENT_CONFIRMING'].includes(order.status)) {
        throw new Error('Order cannot be cancelled')
    }

    // Restore stock
    for (const item of order.items) {
        await prisma.product.update({
            where: { id: item.productId },
            data: {
                stock: {
                    increment: item.quantity,
                },
            },
        })
    }

    // Update order status
    return prisma.order.update({
        where: { id },
        data: { status: 'CANCELLED' },
    })
}
