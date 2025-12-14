import { auth } from "@/auth"
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'

async function getAdminStats() {
    const [
        totalUsers,
        totalVendors,
        totalOrders,
        pendingApprovals
    ] = await Promise.all([
        prisma.user.count(),
        prisma.vendor.count(),
        prisma.order.count(),
        prisma.vendor.count({ where: { status: 'PENDING' } })
    ])

    // Quick sales sum (might be heavy in prod, simplified here)
    const paidOrders = await prisma.order.findMany({
        where: { status: 'PAID' },
        select: { totalUSD: true }
    })
    const totalVolume = paidOrders.reduce((acc, o) => acc + o.totalUSD, 0)

    return {
        totalUsers,
        totalVendors,
        totalOrders,
        pendingApprovals,
        totalVolume
    }
}

export default async function AdminDashboard() {
    const session = await auth()
    if (!session || (session.user as any).role !== 'ADMIN') redirect('/login')

    const stats = await getAdminStats()

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Volume</h3>
                    <p className="text-2xl font-bold text-green-600">${stats.totalVolume.toFixed(2)}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Users</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Vendors</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalVendors}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Orders</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOrders}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-amber-500">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Pending Vendors</h3>
                    <p className="text-2xl font-bold text-amber-500">{stats.pendingApprovals}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Placeholder for Management Tables */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 h-64 flex items-center justify-center border border-dashed border-gray-300">
                    <span className="text-gray-400">User Management Module</span>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 h-64 flex items-center justify-center border border-dashed border-gray-300">
                    <span className="text-gray-400">Vendor Management Module</span>
                </div>
            </div>
        </div>
    )
}
