'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function VendorRegisterPage() {
    const router = useRouter()
    const { data: session, update } = useSession()

    const [storeName, setStoreName] = useState('')
    const [description, setDescription] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Redirect if already a seller
    useEffect(() => {
        if (session?.user && (session.user as any).role === 'SELLER') {
            router.push('/vendor/dashboard')
        }
    }, [session, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/vendor/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storeName, description }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to register store')
            }

            // Update session to reflect new role
            await update({ role: 'SELLER' })

            router.push('/vendor/dashboard')
            router.refresh()

        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6">Become a Seller</h1>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                    Start selling your products on our platform today. Setup your store in seconds.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Store Name</label>
                        <input
                            type="text"
                            required
                            value={storeName}
                            onChange={(e) => setStoreName(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-700"
                            placeholder="e.g. My Crypto Store"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-700 h-32"
                            placeholder="Tell us about your store..."
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 font-medium text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Creating Store...' : 'Create Store'}
                    </button>
                </form>
            </div>
        </div>
    )
}
