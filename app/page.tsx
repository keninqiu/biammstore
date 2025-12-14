import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navbar */}
      <nav className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                BIAMM
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link href="/products" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 transition-colors">
                  Products
                </Link>
                <Link href="/vendors" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 transition-colors">
                  Vendors
                </Link>
                <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 transition-colors">
                  About
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/cart" className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </Link>
              <Link href="/login" className="btn-outline px-4 py-2 text-sm">
                Login
              </Link>
              <Link href="/register" className="btn-primary px-4 py-2 text-sm">
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 animate-fade-in">
              Multi-Vendor Marketplace
              <span className="block mt-2 bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-500 bg-clip-text text-transparent">
                Powered by Cryptocurrency
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto animate-slide-up">
              Buy and sell products using Bitcoin, Ethereum, USDT, and BNB.
              Secure, fast, and decentralized payments for the modern marketplace.
            </p>
            <div className="flex flex-wrap justify-center gap-4 animate-slide-up">
              <Link href="/products" className="btn-primary">
                Browse Products
              </Link>
              <Link href="/vendor/register" className="btn-outline">
                Become a Vendor
              </Link>
            </div>
          </div>

          {/* Crypto Icons */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {['BTC', 'ETH', 'USDT', 'BNB'].map((crypto) => (
              <div
                key={crypto}
                className="card-glass p-6 text-center hover:scale-105 transition-transform duration-200 animate-scale-in"
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
                  {crypto[0]}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{crypto}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Accepted</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Why Choose BIAMM?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-6 hover:shadow-2xl transition-shadow">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Secure Payments</h3>
              <p className="text-gray-600 dark:text-gray-400">
                All transactions verified on the blockchain with real-time confirmation tracking.
              </p>
            </div>

            <div className="card p-6 hover:shadow-2xl transition-shadow">
              <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Lightning Fast</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Instant payment generation and automated order processing.
              </p>
            </div>

            <div className="card p-6 hover:shadow-2xl transition-shadow">
              <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Global Access</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Accept payments from anywhere in the world, 24/7.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="card-glass p-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Start Selling?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Join our growing marketplace of vendors and start accepting cryptocurrency payments today.
            </p>
            <Link href="/vendor/register" className="btn-primary inline-block">
              Register as Vendor
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">BIAMM</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                The future of e-commerce, powered by blockchain technology.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Shop</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/products" className="text-gray-600 dark:text-gray-400 hover:text-primary-600">Products</Link></li>
                <li><Link href="/vendors" className="text-gray-600 dark:text-gray-400 hover:text-primary-600">Vendors</Link></li>
                <li><Link href="/categories" className="text-gray-600 dark:text-gray-400 hover:text-primary-600">Categories</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Sell</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/vendor/register" className="text-gray-600 dark:text-gray-400 hover:text-primary-600">Become a Vendor</Link></li>
                <li><Link href="/vendor/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-primary-600">Vendor Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help" className="text-gray-600 dark:text-gray-400 hover:text-primary-600">Help Center</Link></li>
                <li><Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-primary-600">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>&copy; 2024 BIAMM Marketplace. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
