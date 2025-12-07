"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCartStore } from '@/lib/store/cart'
import { useEffect, useState } from 'react'

export default function Navbar() {
    const pathname = usePathname()
    const { totalItems, toggleCart } = useCartStore()
    const [mounted, setMounted] = useState(false)

    // Avoid hydration mismatch for persisted store
    useEffect(() => {
        setMounted(true)
    }, [])

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Products', href: '/products' },
        { name: 'Categories', href: '/categories' },
        { name: 'Vendors', href: '/vendors' },
        { name: 'Prices', href: '/prices' },
    ]

    return (
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                            BIAMM
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href))
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`text-sm font-medium transition-colors hover:text-primary-600 dark:hover:text-primary-400 ${isActive
                                            ? 'text-primary-600 dark:text-primary-400'
                                            : 'text-gray-700 dark:text-gray-200'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            )
                        })}
                    </div>

                    {/* Cart & Mobile Menu Button */}
                    <div className="flex items-center gap-4">
                        {/* Cart Button */}
                        <button
                            className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            onClick={toggleCart}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            {mounted && totalItems() > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce-short">
                                    {totalItems()}
                                </span>
                            )}
                        </button>

                        {/* Mobile Menu Button - simplified */}
                        <div className="md:hidden">
                            <button className="text-gray-500 hover:text-gray-900 focus:outline-none">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}
