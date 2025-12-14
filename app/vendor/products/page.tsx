import { auth } from "@/auth"
import { prisma } from '@/lib/db'
import { listProducts } from '@/lib/product-service'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default async function VendorProductsPage() {
    const session = await auth()
    if (!session) redirect('/login')

    const vendor = await prisma.vendor.findUnique({
        where: { userId: session.user!.id! }
    })

    if (!vendor) redirect('/vendor/register')

    const { products } = await listProducts({ vendorId: vendor.id, limit: 100 })

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">My Products</h1>
                <Link href="/vendor/products/new" className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                    Add New Product
                </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                            <tr>
                                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-300">Product</th>
                                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-300">Price</th>
                                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-300">Stock</th>
                                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-300">Status</th>
                                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No products found. Start selling today!
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                                                    {product.images?.[0] ? (
                                                        <Image
                                                            src={product.images[0].url}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                                                    <div className="text-sm text-gray-500">{product.category.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            ${product.priceUSD.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            {product.stock}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                                ${product.status === 'ACTIVE' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                                                    product.status === 'DRAFT' ? 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700' :
                                                        'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                                                }`}>
                                                {product.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link href={`/vendor/products/${product.id}/edit`} className="text-blue-600 hover:text-blue-800 font-medium">
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
