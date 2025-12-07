import Link from 'next/link'
import { prisma } from '@/lib/db'

// Revalidate every 60 seconds
export const revalidate = 60

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ProductsPage({ searchParams }: Props) {
    const resolvedSearchParams = await searchParams
    const categorySlug = typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : undefined

    // Build filter condition
    const where: any = {
        status: 'ACTIVE'
    }

    if (categorySlug) {
        where.category = {
            slug: categorySlug
        }
    }

    const products = await prisma.product.findMany({
        where,
        include: {
            vendor: true,
            category: true,
            images: true,
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    // Get category name if filtering
    let categoryName = 'Marketplace Products'
    if (categorySlug && products.length > 0) {
        categoryName = products[0].category.name
    } else if (categorySlug) {
        // Fallback if no products found but category filtered
        const category = await prisma.category.findUnique({
            where: { slug: categorySlug },
            select: { name: true }
        })
        if (category) categoryName = category.name
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {categoryName}
                        </h1>
                        {categorySlug && (
                            <Link
                                href="/products"
                                className="text-sm text-primary-600 hover:text-primary-700 mt-1 inline-block"
                            >
                                ← View All Products
                            </Link>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <Link
                            href="/categories"
                            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Browse by Category
                        </Link>
                    </div>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No products found</h3>
                        <p className="mt-2 text-gray-500">
                            {categorySlug ? `No products found in ${categorySlug}.` : 'Check back later for new items.'}
                        </p>
                        {categorySlug && (
                            <Link href="/products" className="mt-4 inline-block text-primary-600 hover:text-primary-500">
                                View all products
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <Link
                                key={product.id}
                                href={`/products/${product.id}`}
                                className="group"
                            >
                                <div className="card h-full flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300">
                                    {/* Image Placeholder or Actual Image */}
                                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 xl:aspect-w-7 xl:aspect-h-8 relative h-48">
                                        {product.images[0] ? (
                                            <img
                                                src={product.images[0].url}
                                                alt={product.name}
                                                className="h-full w-full object-cover object-center group-hover:opacity-75"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400">
                                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2">
                                            <span className="badge badge-primary text-xs">
                                                {product.category.name}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-4 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="mt-1 text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                                                {product.name}
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                                                {product.description}
                                            </p>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="text-xl font-bold text-gray-900 dark:text-white">
                                                ${product.priceUSD.toFixed(2)}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <span className="truncate max-w-[100px]">{product.vendor.storeName}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
