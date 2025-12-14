import { NextResponse } from 'next/server'
import { auth } from "@/auth"
import { prisma } from '@/lib/db'
import { createProduct } from '@/lib/product-service'
import { z } from 'zod'

const productSchema = z.object({
    name: z.string().min(3),
    description: z.string().min(10),
    priceUSD: z.number().positive(),
    stock: z.number().int().nonnegative(),
    categoryId: z.string(),
    images: z.array(z.string().url()).optional()
})

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session || (session.user as any).role === 'BUYER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const vendor = await prisma.vendor.findUnique({
            where: { userId: session.user!.id! }
        })

        if (!vendor) {
            return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 })
        }

        const body = await request.json()
        const validatedData = productSchema.parse(body)

        const product = await createProduct({
            ...validatedData,
            vendorId: vendor.id,
        })

        return NextResponse.json({ product }, { status: 201 })

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to create product' },
            { status: 400 }
        )
    }
}
