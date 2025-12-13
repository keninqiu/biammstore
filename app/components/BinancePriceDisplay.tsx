'use client'

import { useEffect, useState } from 'react'
import { type CryptoCurrency } from '@/lib/crypto-config'

interface PriceData {
    BTC: number
    ETH: number
    BNB: number
    USDT: number
    SOL: number
    USDC: number
}

const CURRENCY_ICONS: Record<CryptoCurrency, string> = {
    BTC: '₿',
    ETH: 'Ξ',
    BNB: 'BNB',
    USDT: '₮',
    SOL: '◎',
    USDC: '$'
}

const CURRENCY_COLORS: Record<CryptoCurrency, string> = {
    BTC: 'from-orange-500 to-yellow-500',
    ETH: 'from-purple-500 to-blue-500',
    BNB: 'from-yellow-400 to-yellow-600',
    USDT: 'from-green-500 to-emerald-500',
    SOL: 'from-purple-500 to-teal-500',
    USDC: 'from-blue-500 to-cyan-500'
}

export default function BinancePriceDisplay() {
    const [prices, setPrices] = useState<PriceData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

    const fetchPrices = async () => {
        try {
            const response = await fetch('/api/crypto/prices')
            if (!response.ok) {
                throw new Error('Failed to fetch prices')
            }
            const data = await response.json()
            setPrices(data)
            setLastUpdate(new Date())
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // Initial fetch
        fetchPrices()

        // Auto-refresh every 10 seconds
        const interval = setInterval(fetchPrices, 10000)

        return () => clearInterval(interval)
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-pulse space-y-4 w-full max-w-4xl">
                    <div className="h-24 bg-gray-200 rounded-xl"></div>
                    <div className="h-24 bg-gray-200 rounded-xl"></div>
                    <div className="h-24 bg-gray-200 rounded-xl"></div>
                    <div className="h-24 bg-gray-200 rounded-xl"></div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-6 max-w-md">
                    <h3 className="font-bold text-lg mb-2">❌ Error Loading Prices</h3>
                    <p>{error}</p>
                    <button
                        onClick={fetchPrices}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    if (!prices) return null

    const currencies: CryptoCurrency[] = ['BTC', 'ETH', 'BNB', 'SOL', 'USDT', 'USDC']

    return (
        <div className="p-8 space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Live Crypto Prices
                </h1>
                <p className="text-gray-600">
                    Powered by Binance Free API • Last updated: {lastUpdate.toLocaleTimeString()}
                </p>
                <button
                    onClick={fetchPrices}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                    Refresh Now
                </button>
            </div>

            {/* Price Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {currencies.map((currency) => (
                    <div
                        key={currency}
                        className="relative group overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
                    >
                        {/* Gradient Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${CURRENCY_COLORS[currency]} opacity-5 group-hover:opacity-10 transition-opacity`}></div>

                        {/* Content */}
                        <div className="relative p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-3xl opacity-75">
                                    {CURRENCY_ICONS[currency]}
                                </span>
                                <span className="text-sm font-semibold text-gray-500">
                                    {currency}
                                </span>
                            </div>

                            <div className="space-y-1">
                                <div className="text-3xl font-bold text-gray-900">
                                    ${prices[currency].toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                </div>
                                <div className="text-xs text-gray-500">USD</div>
                            </div>
                        </div>

                        {/* Bottom accent */}
                        <div className={`h-1 bg-gradient-to-r ${CURRENCY_COLORS[currency]}`}></div>
                    </div>
                ))}
            </div>

            {/* Info Section */}
            <div className="mt-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                    ✨ About This Integration
                </h2>
                <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                        <span className="mr-2">✅</span>
                        <span><strong>No API Key Required</strong> - Using Binance&apos;s free public API</span>
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2">✅</span>
                        <span><strong>Real-Time Prices</strong> - Updated every 10 seconds</span>
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2">✅</span>
                        <span><strong>Reliable Source</strong> - Direct from Binance exchange</span>
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2">✅</span>
                        <span><strong>Database Caching</strong> - Fallback to cached prices if API is unavailable</span>
                    </li>
                </ul>
            </div>

            {/* API Endpoint Info */}
            <div className="bg-gray-900 rounded-xl p-6 text-white">
                <h3 className="font-bold mb-3 text-green-400">📡 API Endpoint</h3>
                <code className="block bg-gray-800 px-4 py-3 rounded-lg text-sm overflow-x-auto">
                    GET /api/crypto/prices
                </code>
                <p className="mt-3 text-sm text-gray-300">
                    Try it: <code className="bg-gray-800 px-2 py-1 rounded">curl http://localhost:3000/api/crypto/prices</code>
                </p>
            </div>
        </div>
    )
}
