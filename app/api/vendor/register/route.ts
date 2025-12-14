import { NextResponse } from 'next/server'
import { auth } from "@/auth"
import { prisma } from '@/lib/db'
import { z } from 'zod'

const vendorSchema = z.object({
    storeName: z.string().min(3),
    description: z.string().min(10)
})

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { storeName, description } = vendorSchema.parse(body)

        // Check if already a vendor (or store name taken, though logic permits one per user)
        const existing = await prisma.vendor.findUnique({
            where: { userId: session.user.id }
        })

        if (existing) {
            return NextResponse.json({ error: 'User already has a store' }, { status: 400 })
        }

        // Create Vendor and Update User Role in transaction
        const vendor = await prisma.$transaction(async (tx) => {
            const newVendor = await tx.vendor.create({
                data: {
                    userId: session.user!.id!,
                    storeName,
                    description,
                    status: 'PENDING'
                }
            })

            await tx.user.update({
                where: { id: session.user!.id },
                data: { role: 'SELLER' }
            })

            return newVendor
        })

        return NextResponse.json({ vendor })

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Vendor registration failed' },
            { status: 400 }
        )
    }
}
