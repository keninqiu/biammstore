import prisma from '@/lib/db'

export async function createProduct(data: {
    vendorId: string
    categoryId: string
    name: string
    description: string
    priceUSD: number
    stock: number
    images?: string[]
}) {
    const product = await prisma.product.create({
        data: {
            vendorId: data.vendorId,
            categoryId: data.categoryId,
            name: data.name,
            description: data.description,
            priceUSD: data.priceUSD,
            stock: data.stock,
            status: 'ACTIVE',
            images: data.images
                ? {
                    create: data.images.map((url, index) => ({
                        url,
                        order: index,
                    })),
                }
                : undefined,
        },
        include: {
            images: true,
            category: true,
            vendor: {
                select: {
                    storeName: true,
                    rating: true,
                },
            },
        },
    })

    return product
}

export async function getProductById(id: string) {
    return prisma.product.findUnique({
        where: { id },
        include: {
            images: {
                orderBy: {
                    order: 'asc',
                },
            },
            category: true,
            vendor: {
                select: {
                    id: true,
                    storeName: true,
                    rating: true,
                },
            },
            reviews: {
                include: {
                    user: {
                        select: {
                            name: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: 10,
            },
        },
    })
}

export async function listProducts(params?: {
    categoryId?: string
    vendorId?: string
    search?: string
    status?: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'
    minPrice?: number
    maxPrice?: number
    page?: number
    limit?: number
}) {
    const page = params?.page || 1
    const limit = params?.limit || 20
    const skip = (page - 1) * limit

    const where: any = {}

    if (params?.categoryId) {
        where.categoryId = params.categoryId
    }

    if (params?.vendorId) {
        where.vendorId = params.vendorId
    }

    if (params?.status) {
        where.status = params.status
    }

    if (params?.search) {
        where.OR = [
            { name: { contains: params.search } },
            { description: { contains: params.search } },
        ]
    }

    if (params?.minPrice !== undefined || params?.maxPrice !== undefined) {
        where.priceUSD = {}
        if (params.minPrice !== undefined) {
            where.priceUSD.gte = params.minPrice
        }
        if (params.maxPrice !== undefined) {
            where.priceUSD.lte = params.maxPrice
        }
    }

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            include: {
                images: {
                    orderBy: {
                        order: 'asc',
                    },
                    take: 1,
                },
                category: true,
                vendor: {
                    select: {
                        storeName: true,
                        rating: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            skip,
            take: limit,
        }),
        prisma.product.count({ where }),
    ])

    return {
        products,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    }
}

export async function updateProduct(
    id: string,
    data: {
        name?: string
        description?: string
        priceUSD?: number
        stock?: number
        status?: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'
        categoryId?: string
    }
) {
    return prisma.product.update({
        where: { id },
        data,
        include: {
            images: true,
            category: true,
        },
    })
}

export async function deleteProduct(id: string) {
    return prisma.product.delete({
        where: { id },
    })
}

export async function updateProductStock(id: string, quantity: number) {
    return prisma.product.update({
        where: { id },
        data: {
            stock: {
                increment: quantity,
            },
        },
    })
}
