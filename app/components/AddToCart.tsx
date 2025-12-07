"use client"

import { useState } from 'react'
import { useCartStore } from '@/lib/store/cart'

type Props = {
    product: {
        id: string
        name: string
        priceUSD: number
        images: { url: string }[]
        vendor: { storeName: string }
        stock: number
    }
}

export default function AddToCart({ product }: Props) {
    const addItem = useCartStore((state) => state.addItem)
    const [isAdded, setIsAdded] = useState(false)

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            name: product.name,
            price: product.priceUSD,
            quantity: 1,
            image: product.images[0]?.url,
            vendorName: product.vendor.storeName
        })

        // Show temporary feedback
        setIsAdded(true)
        setTimeout(() => setIsAdded(false), 2000)
    }

    if (product.stock === 0) {
        return (
            <button
                disabled
                className="w-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 font-bold py-4 px-8 rounded-xl cursor-not-allowed text-lg flex items-center justify-center gap-2"
            >
                Out of Stock
            </button>
        )
    }

    return (
        <button
            onClick={handleAddToCart}
            className={`w-full font-bold py-4 px-8 rounded-xl shadow-lg transform active:scale-95 transition-all text-lg flex items-center justify-center gap-2 ${isAdded
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-primary-600 hover:bg-primary-700 text-white hover:-translate-y-0.5'
                }`}
        >
            {isAdded ? (
                <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Added to Cart!
                </>
            ) : (
                <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Add to Cart
                </>
            )}
        </button>
    )
}
