import { prisma } from '@/lib/db'
import { getReferralStats, generateReferralCode } from '@/lib/referral-service'
import { auth } from "@/auth"
import { redirect } from 'next/navigation'

// Helper to get current user ID (mock or from auth)
// In a real app, use getSession or similar.
// For this demo, we might need a way to identify the user.
// Since we don't have full auth context here, we'll try to get it from a session cookie if available,
// or show a login prompt / "Please Login" message.
async function getCurrentUserId() {
    // TODO: Implement actual auth check
    // For now, return null to force "Please Login" state or assume
    // the user might be logged in via some other mechanism.
    return null
}

export default async function ReferralPage() {
    // In a real scenario, we'd get the user from the session.
    // For now, we'll display a generic message or try to fetch if we had auth.
    // Assuming we might have a simple cookie auth or we just show the structure.

    // MOCK USER FOR DEMO (You can replace this with real auth logic)
    // const userId = '...' 
    const userId = null

    if (!userId) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
                    <h1 className="text-3xl font-bold mb-4">Referral Program</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Login to view your referral code and earnings.
                    </p>
                    <a href="/login" className="inline-block bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors">
                        Login
                    </a>
                </div>
            </div>
        )
    }

    const user = await prisma.user.findUnique({
        where: { id: userId }
    })

    if (!user) {
        return <div>User not found</div>
    }

    // Ensure user has a referral code
    let referralCode = user.referralCode
    if (!referralCode) {
        // Generate if missing (lazy generation)
        referralCode = await generateReferralCode()
        await prisma.user.update({
            where: { id: userId },
            data: { referralCode }
        })
    }

    const stats = await getReferralStats(userId)

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Referral Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Earnings</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        ${stats.totalEarnings.toFixed(2)}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Pending (Locked)</h3>
                    <p className="text-3xl font-bold text-amber-500">
                        ${stats.pending.toFixed(2)}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Available to Withdraw</h3>
                    <p className="text-3xl font-bold text-green-500 mb-4">
                        ${stats.available.toFixed(2)}
                    </p>
                    <button
                        disabled={stats.available <= 0}
                        className="w-full bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Withdraw
                    </button>
                </div>
            </div>

            {/* Link Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-8 text-white mb-12">
                <h2 className="text-2xl font-bold mb-4">Your Referral Link</h2>
                <p className="mb-6 opacity-90">Share this link to earn 5% on every purchase made by your referrals.</p>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between border border-white/20">
                    <code className="text-lg font-mono">
                        {process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?ref={referralCode}
                    </code>
                    <button
                        // onClick={() => navigator.clipboard.writeText(...)} 
                        className="bg-white text-blue-600 font-bold py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                        Copy
                    </button>
                </div>
            </div>

            {/* History Table */}
            <h2 className="text-2xl font-bold mb-6">Reward History</h2>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="p-4 font-medium text-gray-500">Date</th>
                                <th className="p-4 font-medium text-gray-500">Order ID</th>
                                <th className="p-4 font-medium text-gray-500">Amount</th>
                                <th className="p-4 font-medium text-gray-500">Status</th>
                                <th className="p-4 font-medium text-gray-500">Unlock Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {stats.rewards.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                        No rewards yet. Share your link to start earning!
                                    </td>
                                </tr>
                            ) : stats.rewards.map((reward: any) => (
                                <tr key={reward.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="p-4">{new Date(reward.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4 font-mono text-xs">{reward.orderId}</td>
                                    <td className="p-4 font-bold text-green-600">+${reward.amount.toFixed(2)}</td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${reward.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                                            reward.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                                                reward.status === 'CANCELED' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {reward.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">
                                        {new Date(reward.unlockDate).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
