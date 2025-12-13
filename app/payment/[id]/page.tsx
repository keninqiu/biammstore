import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import CryptoPayment from '@/app/components/CryptoPayment'
import WalletConnect from '@/app/components/WalletConnect'
import Link from 'next/link'

// Don't cache this page so we always see fresh status
export const dynamic = 'force-dynamic'

type Props = {
    params: Promise<{ id: string }>
}

export default async function PaymentPage({ params }: Props) {
    const { id } = await params

    const payment = await prisma.payment.findUnique({
        where: { id },
        include: {
            order: {
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            }
        }
    })

    if (!payment) {
        notFound()
    }

    const { order } = payment

    return (
        <div className="min-h-screen pt-24 pb-12 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Complete Your Payment</h1>
                    <p className="text-gray-500">Order #{order.id.slice(0, 8)}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Payment Component */}
                    <div>
                        {/* @ts-ignore */}
                        {payment.paymentMethod === 'DIRECT' || !payment.paymentMethod ? (
                            <CryptoPayment
                                address={payment.paymentAddress}
                                amount={payment.amount}
                                currency={payment.currency}
                                paymentId={payment.id}
                            />
                            /* @ts-ignore */
                        ) : payment.paymentMethod === 'CONNECT' ? (
                            <WalletConnect
                                amount={payment.amount}
                                currency={payment.currency}
                                network={payment.network}
                                paymentAddress={payment.paymentAddress}
                            />
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden p-8 text-center">
                                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                                    ⚡
                                </div>
                                <h3 className="text-xl font-bold mb-2">X402 Payment</h3>
                                <p className="text-gray-500 mb-6">Authorized X402 Gateway Transfer</p>
                                <button className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition-colors">
                                    Proceed with X402
                                </button>
                            </div>
                        )}

                        {/* Status Checker (Mock) - Still relevant for Direct Transfer mostly, but keeping for all for now */}
                        <div className="mt-6 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium animate-pulse">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Awaiting Payment...
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                Your order will be processed automatically once the transaction is confirmed on the blockchain.
                            </p>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
                        <h2 className="text-lg font-bold mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">Order Details</h2>

                        <div className="space-y-4 mb-6">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {/* We'd likely fetch images here if we included them, but keeping query simple */}
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">IMG</div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-sm line-clamp-2">{item.product.name}</h3>
                                        <div className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</div>
                                    </div>
                                    <div className="font-medium text-sm">
                                        ${(item.priceUSD * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-2">
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Subtotal</span>
                                <span>${order.totalUSD.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white pt-2">
                                <span>Total</span>
                                <span>${order.totalUSD.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                            <h3 className="text-sm font-bold mb-2">Shipping to:</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                                { /* In a real app we'd fetch the address relation. For now, referencing what user just typed. */}
                                {/* Since we didn't include address in initial query, keeping it simple. */}
                                (Address provided at checkout)
                            </p>
                        </div>

                        <div className="mt-6">
                            <Link href="/" className="text-primary-600 hover:underline text-sm flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Return to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
