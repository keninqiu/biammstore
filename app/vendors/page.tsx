import Link from 'next/link'
import { prisma } from '@/lib/db'

export const revalidate = 60

export default async function VendorsPage() {
    const vendors = await prisma.vendor.findMany({
        where: {
            status: 'APPROVED'
        },
        include: {
            user: {
                select: {
                    name: true,
                    email: true
                }
            },
            _count: {
                select: { products: true }
            }
        },
        orderBy: {
            rating: 'desc'
        }
    })

    // Helper function to render stars
    const renderStars = (rating: number) => {
        return (
            <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-5 h-5 ${i < Math.floor(rating) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Our Trusted Vendors
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Shop directly from verified sellers
                    </p>
                </div>

                {vendors.length === 0 ? (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No active vendors found</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {vendors.map((vendor) => (
                            <div key={vendor.id} className="card overflow-hidden hover:shadow-xl transition-shadow">
                                <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
                                    <div className="absolute -bottom-10 left-6">
                                        <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full border-4 border-white dark:border-gray-700 flex items-center justify-center text-3xl shadow-md">
                                            {vendor.storeName.charAt(0)}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-12 p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                                {vendor.storeName}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                by {vendor.user.name}
                                            </p>
                                        </div>
                                        {renderStars(vendor.rating)}
                                    </div>

                                    <p className="mt-4 text-gray-600 dark:text-gray-300 line-clamp-2 min-h-[3rem]">
                                        {vendor.description || 'No description available'}
                                    </p>

                                    <div className="mt-6 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
                                        <div className="text-sm text-gray-500">
                                            <span className="font-semibold text-gray-900 dark:text-white">{vendor._count.products}</span> Products active
                                        </div>
                                        <Link
                                            href={`/products?vendor=${vendor.id}`}
                                            className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center"
                                        >
                                            View Products
                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
