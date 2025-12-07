import { NextResponse } from 'next/server'
import { getCryptoPrices } from '@/lib/crypto-service'

export async function GET() {
    try {
        const prices = await getCryptoPrices()
        return NextResponse.json(prices)
    } catch (error) {
        console.error('Error fetching prices:', error)
        return NextResponse.json(
            { error: 'Failed to fetch prices' },
            { status: 500 }
        )
    }
}
