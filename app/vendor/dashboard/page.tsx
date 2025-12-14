import { auth } from "@/auth"
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function getVendorStats(userId: string) {
    const vendor = await prisma.vendor.findUnique({
        where: { userId },
        include: { _count: { select: { products: true } } }
    })

    if (!vendor) return null

    // Get orders containing vendor products
    // This query might be complex, simplifying for stats
    const products = await prisma.product.findMany({
        where: { vendorId: vendor.id },
        select: { id: true }
    })
    const productIds = products.map(p => p.id)

    const orderItems = await prisma.orderItem.findMany({
        where: { productId: { in: productIds } },
        include: { order: true }
    })

    const totalSales = orderItems.reduce((sum, item) => sum + (item.priceUSD * item.quantity), 0)
    const totalOrders = new Set(orderItems.map(item => item.orderId)).size

    return {
        vendor,
        totalSales,
        totalOrders
    }
}

export default async function VendorDashboard() {
    const session = await auth()
    if (!session) redirect('/login')

    const stats = await getVendorStats(session.user!.id!)

    if (!stats) {
        redirect('/vendor/register')
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Seller Dashboard</h1>
            <div className="text-xl mb-4 text-gray-600">Store: <span className="font-bold text-black dark:text-white">{stats.vendor.storeName}</span></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Sales</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">${stats.totalSales.toFixed(2)}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Orders</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalOrders}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Products</h3>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.vendor._count.products}</p>
                    </div>
                    <Link href="/vendor/products" className="mt-4 text-blue-600 hover:text-blue-500 font-medium text-sm flex items-center">
                        View All Products
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                    <div className="flex flex-col gap-3">
                        <Link href="/vendor/products/new" className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-left block text-center">
                            Add New Product
                        </Link>
                        <Link href="/vendor/orders" className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-left block text-center">
                            Manage Orders
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
