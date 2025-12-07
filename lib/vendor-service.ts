import prisma from '@/lib/db'

export async function createVendor(data: {
    userId: string
    storeName: string
    description?: string
    ethAddress?: string
    btcAddress?: string
    bscAddress?: string
}) {
    // Check if user already has a vendor profile
    const existing = await prisma.vendor.findUnique({
        where: { userId: data.userId },
    })

    if (existing) {
        throw new Error('Vendor profile already exists')
    }

    const vendor = await prisma.vendor.create({
        data: {
            userId: data.userId,
            storeName: data.storeName,
            description: data.description,
            ethAddress: data.ethAddress,
            btcAddress: data.btcAddress,
            bscAddress: data.bscAddress,
            status: 'PENDING',
        },
        include: {
            user: {
                select: {
                    email: true,
                    name: true,
                },
            },
        },
    })

    return vendor
}

export async function getVendorByUserId(userId: string) {
    return prisma.vendor.findUnique({
        where: { userId },
        include: {
            user: {
                select: {
                    email: true,
                    name: true,
                },
            },
        },
    })
}

export async function getVendorById(id: string) {
    return prisma.vendor.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    email: true,
                    name: true,
                },
            },
        },
    })
}

export async function updateVendor(
    id: string,
    data: {
        storeName?: string
        description?: string
        ethAddress?: string
        btcAddress?: string
        bscAddress?: string
    }
) {
    return prisma.vendor.update({
        where: { id },
        data,
    })
}

export async function approveVendor(id: string) {
    return prisma.vendor.update({
        where: { id },
        data: { status: 'APPROVED' },
    })
}

export async function rejectVendor(id: string) {
    return prisma.vendor.update({
        where: { id },
        data: { status: 'REJECTED' },
    })
}

export async function listVendors(status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED') {
    return prisma.vendor.findMany({
        where: status ? { status } : undefined,
        include: {
            user: {
                select: {
                    email: true,
                    name: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    })
}

export async function getVendorStats(vendorId: string) {
    const [totalProducts, totalOrders, revenue] = await Promise.all([
        prisma.product.count({
            where: { vendorId },
        }),
        prisma.orderItem.count({
            where: {
                product: {
                    vendorId,
                },
            },
        }),
        prisma.orderItem.aggregate({
            where: {
                product: {
                    vendorId,
                },
                order: {
                    status: 'PAID',
                },
            },
            _sum: {
                priceUSD: true,
            },
        }),
    ])

    return {
        totalProducts,
        totalOrders,
        revenue: revenue._sum.priceUSD || 0,
    }
}
