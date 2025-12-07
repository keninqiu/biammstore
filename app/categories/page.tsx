import Link from 'next/link'
import { prisma } from '@/lib/db'

// Revalidate every 60 seconds
export const revalidate = 60

export default async function CategoriesPage() {
    const categories = await prisma.category.findMany({
        include: {
            _count: {
                select: { products: true }
            }
        },
        orderBy: {
            order: 'asc'
        }
    })

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Browse Categories
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Explore our wide range of products by category
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/products?category=${category.slug}`}
                            className="group"
                        >
                            <div className="card overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="h-48 bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center">
                                    {/* Icon based on slug or generic icon */}
                                    <span className="text-6xl text-white opacity-80 group-hover:scale-110 transition-transform duration-300">
                                        {category.slug === 'electronics' && '🔌'}
                                        {category.slug === 'fashion' && '👕'}
                                        {category.slug === 'home' && '🏡'}
                                        {!['electronics', 'fashion', 'home'].includes(category.slug) && '📦'}
                                    </span>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                                        {category.name}
                                    </h3>
                                    <div className="mt-4 flex items-center justify-between text-sm">
                                        <span className="text-gray-500 font-medium">
                                            {category._count.products} Products
                                        </span>
                                        <span className="text-primary-600 group-hover:translate-x-1 transition-transform inline-flex items-center">
                                            Browse
                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
