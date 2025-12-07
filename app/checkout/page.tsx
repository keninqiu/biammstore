"use client"

import { useState } from 'react'
import { useCartStore } from '@/lib/store/cart'
import { useRouter } from 'next/navigation'
import { SUPPORTED_NETWORKS } from '@/lib/crypto-config'

export default function CheckoutPage() {
    const router = useRouter()
    const { items, totalPrice, clearCart } = useCartStore()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [step, setStep] = useState(1) // 1: Details, 2: Payment
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        city: '',
        country: '',
        zip: '',
    })
    const [currency, setCurrency] = useState<'BTC' | 'ETH' | 'USDT' | 'BNB' | ''>('')
    const [network, setNetwork] = useState('')

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: items.map(item => ({ id: item.id, quantity: item.quantity, price: item.price })),
                    shipping: formData,
                    currency,
                    network
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to place order')
            }

            // Success
            clearCart()
            router.push(`/payment/${data.paymentId}`)

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen pt-24 pb-8 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
                    <button onClick={() => router.push('/products')} className="text-primary-600 hover:underline">Continue Shopping</button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-24 pb-12 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>

                {error && (
                    <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Step 1: Shipping Info */}
                        <div className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 ${step === 2 ? 'opacity-50 pointer-events-none' : ''}`}>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center text-sm font-bold">1</span>
                                Shipping Details
                            </h2>

                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    required
                                    name="firstName"
                                    placeholder="First Name"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 w-full"
                                />
                                <input
                                    required
                                    name="lastName"
                                    placeholder="Last Name"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 w-full"
                                />
                                <input
                                    required
                                    name="email"
                                    type="email"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="col-span-2 p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 w-full"
                                />
                                <input
                                    required
                                    name="address"
                                    placeholder="Address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="col-span-2 p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 w-full"
                                />
                                <input
                                    required
                                    name="city"
                                    placeholder="City"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 w-full"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        required
                                        name="country"
                                        placeholder="Country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 w-full"
                                    />
                                    <input
                                        required
                                        name="zip"
                                        placeholder="ZIP / Postal"
                                        value={formData.zip}
                                        onChange={handleInputChange}
                                        className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 w-full"
                                    />
                                </div>
                            </div>

                            {step === 1 && (
                                <button
                                    onClick={() => {
                                        // Simple validation
                                        if (Object.values(formData).every(v => v)) setStep(2)
                                        else setError('Please fill in all fields')
                                    }}
                                    className="mt-6 w-full bg-black dark:bg-white text-white dark:text-black font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
                                >
                                    Continue to Payment
                                </button>
                            )}
                        </div>

                        {/* Step 2: Payment */}
                        <div className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 ${step === 1 ? 'opacity-50 pointer-events-none' : ''}`}>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center text-sm font-bold">2</span>
                                Payment Method
                            </h2>

                            {/* Payment Method Selection */}
                            <div className="grid grid-cols-2 gap-4">
                                {['BTC', 'ETH', 'USDT', 'BNB'].map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => {
                                            setCurrency(c as any)
                                            setNetwork('') // Reset network on currency change
                                        }}
                                        className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${currency === c
                                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                                            }`}
                                    >
                                        <span className="font-bold">{c}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Network Selection */}
                            {currency && (
                                <div className="mt-6 animate-fadeIn">
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Select Network for {currency}
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {SUPPORTED_NETWORKS[currency as keyof typeof SUPPORTED_NETWORKS]?.map((net) => (
                                            <button
                                                key={net}
                                                onClick={() => setNetwork(net)}
                                                className={`p-3 rounded-lg border text-sm font-medium transition-all ${network === net
                                                    ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                    }`}
                                            >
                                                {net}
                                            </button>
                                        ))}
                                    </div>
                                    {!network && (
                                        <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                                            Please select a network to proceed.
                                        </p>
                                    )}
                                </div>
                            )}

                            {step === 2 && (
                                <div className="mt-6 flex gap-4">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="px-6 py-3 font-medium text-gray-500 hover:text-gray-900"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!currency || !network || loading}
                                        className="flex-1 bg-primary-600 text-white font-bold py-3 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? 'Processing...' : `Pay with ${currency}`}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-24">
                            <h3 className="text-lg font-bold mb-4">Order Summary</h3>

                            <div className="space-y-4 mb-6">
                                {items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-start text-sm">
                                        <div>
                                            <span className="font-medium">{item.name}</span>
                                            <div className="text-gray-500">Qty: {item.quantity}</div>
                                        </div>
                                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Subtotal</span>
                                    <span>${totalPrice().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Shipping</span>
                                    <span>Free</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2">
                                    <span>Total</span>
                                    <span>${totalPrice().toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
