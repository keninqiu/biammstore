/**
 * Binance Free API Price Service
 * No API key required - uses public endpoints
 */

import { type CryptoCurrency } from '@/lib/crypto-config'

// Binance API base URL (public, no auth required)
const BINANCE_API_BASE = 'https://api.binance.com/api/v3'

// Symbol mapping for Binance (all pairs against USDT)
const BINANCE_SYMBOLS: Record<CryptoCurrency, string> = {
    BTC: 'BTCUSDT',
    ETH: 'ETHUSDT',
    BNB: 'BNBUSDT',
    SOL: 'SOLUSDT',
    USDC: 'USDCUSDT',
    USDT: 'USDT', // Special case - always $1
}

interface BinancePriceResponse {
    symbol: string
    price: string
}

/**
 * Get current price for a single cryptocurrency from Binance
 */
export async function getBinancePrice(currency: CryptoCurrency): Promise<number> {
    // USDT is always $1
    if (currency === 'USDT') {
        return 1.0
    }

    const symbol = BINANCE_SYMBOLS[currency]

    try {
        const response = await fetch(`${BINANCE_API_BASE}/ticker/price?symbol=${symbol}`, {
            next: { revalidate: 10 } // Cache for 10 seconds in Next.js
        })

        if (!response.ok) {
            throw new Error(`Binance API error: ${response.status}`)
        }

        const data: BinancePriceResponse = await response.json()
        return parseFloat(data.price)
    } catch (error) {
        console.error(`Error fetching ${currency} price from Binance:`, error)
        throw error
    }
}

/**
 * Get current prices for all supported cryptocurrencies from Binance
 * This uses the batch endpoint which is more efficient
 */
export async function getBinancePrices(): Promise<Record<CryptoCurrency, number>> {
    try {
        // Get all symbols except USDT
        const symbols = Object.values(BINANCE_SYMBOLS).filter(s => s !== 'USDT')
        const symbolsParam = JSON.stringify(symbols)

        const response = await fetch(`${BINANCE_API_BASE}/ticker/price?symbols=${symbolsParam}`, {
            next: { revalidate: 10 } // Cache for 10 seconds in Next.js
        })

        if (!response.ok) {
            throw new Error(`Binance API error: ${response.status}`)
        }

        const data: BinancePriceResponse[] = await response.json()

        // Map response to our format
        const prices: Record<string, number> = {
            USDT: 1.0 // USDT is always $1
        }

        data.forEach(item => {
            // Find which currency this symbol belongs to
            for (const [currency, symbol] of Object.entries(BINANCE_SYMBOLS)) {
                if (item.symbol === symbol) {
                    prices[currency] = parseFloat(item.price)
                    break
                }
            }
        })

        return prices as Record<CryptoCurrency, number>
    } catch (error) {
        console.error('Error fetching crypto prices from Binance:', error)
        throw error
    }
}

/**
 * Get 24-hour price change statistics for a currency
 * Useful for displaying price trends
 */
export async function getBinance24hStats(currency: CryptoCurrency) {
    if (currency === 'USDT') {
        return {
            symbol: 'USDT',
            price: '1.00000000',
            priceChange: '0.00000000',
            priceChangePercent: '0.00',
            highPrice: '1.00000000',
            lowPrice: '1.00000000',
            volume: '0',
            quoteVolume: '0',
        }
    }

    const symbol = BINANCE_SYMBOLS[currency]

    try {
        const response = await fetch(`${BINANCE_API_BASE}/ticker/24hr?symbol=${symbol}`, {
            next: { revalidate: 60 } // Cache for 1 minute
        })

        if (!response.ok) {
            throw new Error(`Binance API error: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error(`Error fetching 24h stats for ${currency}:`, error)
        throw error
    }
}

/**
 * Test function to verify Binance API connectivity
 */
export async function testBinanceConnection(): Promise<boolean> {
    try {
        const response = await fetch(`${BINANCE_API_BASE}/ping`)
        return response.ok
    } catch (error) {
        console.error('Binance API connection test failed:', error)
        return false
    }
}
