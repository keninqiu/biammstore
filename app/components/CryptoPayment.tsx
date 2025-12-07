"use client"

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

type Props = {
    address: string
    amount: number
    currency: string
    paymentId: string
}

export default function CryptoPayment({ address, amount, currency, paymentId }: Props) {
    const [qrDataUrl, setQrDataUrl] = useState('')
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        // Generate QR Code
        const generateQR = async () => {
            try {
                // Format depends on currency, simple address for now
                const url = await QRCode.toDataURL(address)
                setQrDataUrl(url)
            } catch (err) {
                console.error(err)
            }
        }
        generateQR()
    }, [address])

    const handleCopy = () => {
        navigator.clipboard.writeText(address)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 text-center border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-500 mb-2">Send exact amount</h3>
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {amount} <span className="text-lg text-gray-400">{currency}</span>
                </div>
            </div>

            <div className="p-8 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50">
                {qrDataUrl ? (
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                        <img src={qrDataUrl} alt="Payment QR Code" className="w-48 h-48" />
                    </div>
                ) : (
                    <div className="w-48 h-48 bg-gray-200 animate-pulse rounded-xl"></div>
                )}
                <p className="mt-4 text-sm text-gray-500">Scan to Pay</p>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-gray-700">
                <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                    {currency} Deposit Address
                </label>
                <div
                    onClick={handleCopy}
                    className="group relative flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    <code className="text-sm font-mono text-gray-800 dark:text-gray-200 truncate pr-8">
                        {address}
                    </code>
                    <div className="absolute right-3 text-gray-400 group-hover:text-primary-600">
                        {copied ? (
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-xs text-center">
                Only send <strong>{currency}</strong> to this address. Sending other assets will result in permanent loss.
            </div>
        </div>
    )
}
