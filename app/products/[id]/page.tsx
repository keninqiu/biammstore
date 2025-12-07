import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import AddToCart from '@/app/components/AddToCart'

// Revalidate every 60 seconds
export const revalidate = 60

type Props = {
    params: Promise<{ id: string }>
}

export default async function ProductDetailPage({ params }: Props) {
    const { id } = await params

    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            vendor: {
                include: {
                    user: {
                        select: { name: true }
                    }
                }
            },
            category: true,
            images: true,
        }
    })

    if (!product) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Breadcrumb */}
                <nav className="flex mb-8 text-sm text-gray-500">
                    <Link href="/" className="hover:text-primary-600">Home</Link>
                    <span className="mx-2">/</span>
                    <Link href="/products" className="hover:text-primary-600">Products</Link>
                    <span className="mx-2">/</span>
                    <Link href={`/products?category=${product.category.slug}`} className="hover:text-primary-600">{product.category.name}</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 dark:text-white truncate max-w-xs">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* Product Images */}
                    <div className="space-y-4">
                        <div className="aspect-w-4 aspect-h-3 w-full overflow-hidden rounded-xl bg-gray-200">
                            {product.images[0] ? (
                                <img
                                    src={product.images[0].url}
                                    alt={product.name}
                                    className="h-full w-full object-cover object-center"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        {/* Thumbnail gallery could go here */}
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {product.name}
                        </h1>

                        <div className="mt-4 flex items-center justify-between">
                            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                                ${product.priceUSD.toFixed(2)}
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${product.stock > 0
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}>
                                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                            </div>
                        </div>

                        <div className="mt-8 border-t border-b border-gray-200 dark:border-gray-700 py-6">
                            <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                                <p>{product.description}</p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="flex items-center mb-6">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                        {product.vendor.storeName.charAt(0)}
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        Sold by <Link href={`/products?vendor=${product.vendor.id}`} className="text-primary-600 hover:underline">{product.vendor.storeName}</Link>
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        By {product.vendor.user.name}
                                    </p>
                                </div>
                            </div>

                            <AddToCart product={product} />

                            <p className="mt-4 text-center text-sm text-gray-500">
                                Pay with BTC, ETH, USDT, or BNB
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
