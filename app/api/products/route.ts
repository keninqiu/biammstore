import { NextRequest, NextResponse } from 'next/server'
import { listProducts } from '@/lib/product-service'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const categoryId = searchParams.get('categoryId') || undefined
        const vendorId = searchParams.get('vendorId') || undefined
        const search = searchParams.get('search') || undefined
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')

        const result = await listProducts({
            categoryId,
            vendorId,
            search,
            page,
            limit,
            status: 'ACTIVE',
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error('Error listing products:', error)
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        )
    }
}
