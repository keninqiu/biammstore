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
    const [currency, setCurrency] = useState<'BTC' | 'ETH' | 'USDT' | 'BNB' | 'SOL' | 'USDC' | ''>('')
    const [network, setNetwork] = useState('')
    const [paymentMethod, setPaymentMethod] = useState('')

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
                    network,
                    paymentMethod
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
                        <div className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 ${step > 1 ? 'opacity-50 pointer-events-none' : ''}`}>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step > 1 ? 'bg-green-500 text-white' : 'bg-black dark:bg-white text-white dark:text-black'}`}>
                                    {step > 1 ? '✓' : '1'}
                                </span>
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

                        {/* Step 2: Payment Details (Coin & Network) */}
                        <div className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 ${step !== 2 ? (step > 2 ? 'opacity-50 pointer-events-none' : 'opacity-50 pointer-events-none') : ''}`}>
                            {/* Keep opacity 50 if step 1 or step 3? Actually if step 3, should step 2 be clickable? Ideally yes to edit. But for simplicity let's follow sequential flow. If step > 2, it is done. */}
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step > 2 ? 'bg-green-500 text-white' : (step === 2 ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-200 text-gray-500')}`}>
                                    {step > 2 ? '✓' : '2'}
                                </span>
                                Select Cryptocurrency
                            </h2>

                            {step >= 2 && (
                                <>
                                    {/* Payment Method Selection */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'USDC'].map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => {
                                                    setCurrency(c as any)
                                                    setNetwork('') // Reset network on currency change
                                                    if (step > 2) setStep(2) // Return to step 2 if editing
                                                }}
                                                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${currency === c
                                                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                                                    }`}
                                                disabled={step > 2}
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
                                                        onClick={() => {
                                                            setNetwork(net)
                                                            if (step > 2) setStep(2)
                                                        }}
                                                        className={`p-3 rounded-lg border text-sm font-medium transition-all ${network === net
                                                            ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                            }`}
                                                        disabled={step > 2}
                                                    >
                                                        {net}
                                                    </button>
                                                ))}
                                            </div>
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
                                                onClick={() => setStep(3)}
                                                disabled={!currency || !network}
                                                className="flex-1 bg-black dark:bg-white text-white dark:text-black font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Continue
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Step 3: Payment Type Selection */}
                        <div className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 ${step !== 3 ? 'opacity-50 pointer-events-none' : ''}`}>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 3 ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-200 text-gray-500'}`}>3</span>
                                Payment Method
                            </h2>

                            {step === 3 && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            { id: 'DIRECT', icon: '📝', label: 'Direct Transfer', sub: 'Show QR Code' },
                                            { id: 'CONNECT', icon: '🔗', label: 'Connect Wallet', sub: 'Web3 Wallet' },
                                            { id: 'X402', icon: '⚡', label: 'X402', sub: 'Fast Payment' }
                                        ].map((method) => (
                                            <button
                                                key={method.id}
                                                onClick={() => setPaymentMethod(method.id)}
                                                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === method.id
                                                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                                                    }`}
                                            >
                                                <span className="text-2xl">{method.icon}</span>
                                                <div className="text-center">
                                                    <div className="font-bold whitespace-nowrap">{method.label}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{method.sub}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="mt-8 flex gap-4">
                                        <button
                                            onClick={() => setStep(2)}
                                            className="px-6 py-3 font-medium text-gray-500 hover:text-gray-900"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={!paymentMethod || loading}
                                            className="flex-1 bg-primary-600 text-white font-bold py-3 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {loading ? 'Processing...' : `Complete Order`}
                                        </button>
                                    </div>
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
