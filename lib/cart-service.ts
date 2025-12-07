import prisma from '@/lib/db'

export async function getCart(userId: string) {
    const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: {
            product: {
                include: {
                    images: {
                        take: 1,
                        orderBy: {
                            order: 'asc',
                        },
                    },
                    vendor: {
                        select: {
                            storeName: true,
                        },
                    },
                },
            },
        },
    })

    const total = cartItems.reduce(
        (sum, item) => sum + item.product.priceUSD * item.quantity,
        0
    )

    return {
        items: cartItems,
        total,
        count: cartItems.length,
    }
}

export async function addToCart(userId: string, productId: string, quantity: number = 1) {
    // Check if product exists and has stock
    const product = await prisma.product.findUnique({
        where: { id: productId },
    })

    if (!product) {
        throw new Error('Product not found')
    }

    if (product.stock < quantity) {
        throw new Error('Insufficient stock')
    }

    // Check if item already in cart
    const existing = await prisma.cartItem.findUnique({
        where: {
            userId_productId: {
                userId,
                productId,
            },
        },
    })

    if (existing) {
        // Update quantity
        return prisma.cartItem.update({
            where: { id: existing.id },
            data: {
                quantity: existing.quantity + quantity,
            },
        })
    }

    // Create new cart item
    return prisma.cartItem.create({
        data: {
            userId,
            productId,
            quantity,
        },
    })
}

export async function updateCartItem(id: string, quantity: number) {
    const cartItem = await prisma.cartItem.findUnique({
        where: { id },
        include: { product: true },
    })

    if (!cartItem) {
        throw new Error('Cart item not found')
    }

    if (cartItem.product.stock < quantity) {
        throw new Error('Insufficient stock')
    }

    return prisma.cartItem.update({
        where: { id },
        data: { quantity },
    })
}

export async function removeFromCart(id: string) {
    return prisma.cartItem.delete({
        where: { id },
    })
}

export async function clearCart(userId: string) {
    return prisma.cartItem.deleteMany({
        where: { userId },
    })
}
