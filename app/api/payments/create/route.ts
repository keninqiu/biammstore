import { NextRequest, NextResponse } from 'next/server'
import { createPayment } from '@/lib/crypto-service'
import type { CryptoCurrency } from '@/lib/crypto-config'

export async function POST(request: NextRequest) {
    try {
        const { orderId, currency } = await request.json()

        if (!orderId || !currency) {
            return NextResponse.json(
                { error: 'Order ID and currency are required' },
                { status: 400 }
            )
        }

        const payment = await createPayment(orderId, currency as CryptoCurrency)

        return NextResponse.json(payment)
    } catch (error: any) {
        console.error('Error creating payment:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create payment' },
            { status: 500 }
        )
    }
}
