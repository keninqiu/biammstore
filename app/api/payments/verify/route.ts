import { NextRequest, NextResponse } from 'next/server'
import { verifyPayment } from '@/lib/crypto-service'

export async function POST(request: NextRequest) {
    try {
        const { paymentId, txHash } = await request.json()

        if (!paymentId || !txHash) {
            return NextResponse.json(
                { error: 'Payment ID and transaction hash are required' },
                { status: 400 }
            )
        }

        const confirmed = await verifyPayment(paymentId, txHash)

        return NextResponse.json({ confirmed })
    } catch (error: any) {
        console.error('Error verifying payment:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to verify payment' },
            { status: 500 }
        )
    }
}
