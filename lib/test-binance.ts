/**
 * Test script to verify Binance API integration
 * Run with: npx tsx lib/test-binance.ts
 */

import {
    getBinancePrice,
    getBinancePrices,
    getBinance24hStats,
    testBinanceConnection
} from './binance-price-service'

async function testBinanceAPI() {
    console.log('🚀 Testing Binance Free API Integration...\n')

    // Test 1: Connection
    console.log('1️⃣  Testing connection to Binance API...')
    const isConnected = await testBinanceConnection()
    if (isConnected) {
        console.log('✅ Successfully connected to Binance API\n')
    } else {
        console.log('❌ Failed to connect to Binance API\n')
        return
    }

    // Test 2: Get all prices
    console.log('2️⃣  Fetching all cryptocurrency prices...')
    try {
        const prices = await getBinancePrices()
        console.log('✅ Current Prices (USD):')
        console.log(`   BTC:  $${prices.BTC.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
        console.log(`   ETH:  $${prices.ETH.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
        console.log(`   BNB:  $${prices.BNB.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
        console.log(`   USDT: $${prices.USDT.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`)
    } catch (error) {
        console.log('❌ Failed to fetch prices:', error)
        return
    }

    // Test 3: Get single price
    console.log('3️⃣  Fetching single price (BTC)...')
    try {
        const btcPrice = await getBinancePrice('BTC')
        console.log(`✅ BTC Price: $${btcPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`)
    } catch (error) {
        console.log('❌ Failed to fetch BTC price:', error)
    }

    // Test 4: Get 24h stats
    console.log('4️⃣  Fetching 24h statistics (ETH)...')
    try {
        const stats = await getBinance24hStats('ETH')
        console.log('✅ 24h ETH Statistics:')
        console.log(`   Current Price:  $${parseFloat(stats.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
        console.log(`   24h Change:     ${parseFloat(stats.priceChangePercent).toFixed(2)}%`)
        console.log(`   24h High:       $${parseFloat(stats.highPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
        console.log(`   24h Low:        $${parseFloat(stats.lowPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
        console.log(`   24h Volume:     ${parseFloat(stats.volume).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETH\n`)
    } catch (error) {
        console.log('❌ Failed to fetch 24h stats:', error)
    }

    console.log('✨ All tests completed!\n')
    console.log('💡 Note: Binance free API has no rate limits for basic price queries')
    console.log('💡 No API key required! 🎉')
}

// Run the test
testBinanceAPI().catch(console.error)
