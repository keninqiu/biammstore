import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createPayment } from '@/lib/crypto-service'
import { z } from 'zod'
import bcrypt from 'bcrypt'

// Validation schema
const orderSchema = z.object({
    items: z.array(z.object({
        id: z.string(),
        quantity: z.number().min(1),
        price: z.number() // Validate price consistency in production
    })),
    shipping: z.object({
        email: z.string().email(),
        firstName: z.string().min(2),
        lastName: z.string().min(2),
        address: z.string().min(5),
        city: z.string().min(2),
        country: z.string().min(2),
        zip: z.string().min(2),
    }),
    currency: z.enum(['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'USDC']),
    network: z.string()
})

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { items, shipping, currency, network } = orderSchema.parse(body)

        // 1. Calculate Total (in production, fetch real prices from DB to avoid manipulation)
        // For this demo, we'll verify against DB products
        let totalUSD = 0
        const dbItems: { product: any; quantity: number }[] = []

        for (const item of items) {
            const product = await prisma.product.findUnique({ where: { id: item.id } })
            if (!product) throw new Error(`Product ${item.id} not found`)
            if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`)

            totalUSD += product.priceUSD * item.quantity
            dbItems.push({
                product,
                quantity: item.quantity
            })
        }

        // 2. Find or Create User (Guest Checkout Strategy)
        let user = await prisma.user.findUnique({
            where: { email: shipping.email }
        })

        if (!user) {
            // Create a guest user
            const hashedPassword = await bcrypt.hash('Guest123!', 10)
            user = await prisma.user.create({
                data: {
                    email: shipping.email,
                    name: `${shipping.firstName} ${shipping.lastName}`,
                    password: hashedPassword,
                    role: 'BUYER'
                }
            })
        }

        // 3. Create Order in Transaction
        const order = await prisma.$transaction(async (tx) => {
            // Create Address
            const address = await tx.address.create({
                data: {
                    userId: user.id,
                    fullName: `${shipping.firstName} ${shipping.lastName}`,
                    addressLine: shipping.address,
                    city: shipping.city,
                    country: shipping.country,
                    postalCode: shipping.zip,
                    state: '', // Optional
                    phone: '', // Optional
                }
            })

            // Create Order
            const newOrder = await tx.order.create({
                data: {
                    userId: user.id,
                    status: 'PENDING_PAYMENT',
                    totalUSD,
                    currency,
                    network,
                    cryptoAmount: 0, // Will be updated by createPayment
                    addressId: address.id,
                    items: {
                        create: dbItems.map(item => ({
                            productId: item.product.id,
                            quantity: item.quantity,
                            priceUSD: item.product.priceUSD
                        }))
                    }
                }
            })

            // Update Stock
            for (const item of dbItems) {
                await tx.product.update({
                    where: { id: item.product.id },
                    data: { stock: { decrement: item.quantity } }
                })
            }

            return newOrder
        })

        // 4. Generate Payment
        const payment = await createPayment(order.id, currency, network, totalUSD)

        return NextResponse.json({
            orderId: order.id,
            paymentId: payment.id,
            paymentAddress: payment.paymentAddress,
            cryptoAmount: payment.amount,
            currency: payment.currency,
            totalUSD: order.totalUSD
        })

    } catch (error) {
        console.error('Order creation failed:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Order processing failed' },
            { status: 400 }
        )
    }
}
