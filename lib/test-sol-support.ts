import { getBinancePrice, getBinancePrices } from './binance-price-service'
import { NETWORK_CONFIG } from './crypto-config'

async function testSolanaSupport() {
    console.log('Testing Solana Support...')

    // 1. Test Price Fetching
    try {
        console.log('\n--- Testing Price Fetching ---')
        const solPrice = await getBinancePrice('SOL')
        console.log(`SOL Price: $${solPrice}`)

        if (solPrice <= 0) throw new Error('Invalid SOL price')

        const allPrices = await getBinancePrices()
        console.log('All Prices:', allPrices)

        if (!allPrices.SOL) throw new Error('SOL missing from batch prices')

        console.log('✅ Price fetching works!')
    } catch (error) {
        console.error('❌ Price fetching failed:', error)
    }

    // 2. Test Config
    console.log('\n--- Testing Configuration ---')
    if (NETWORK_CONFIG.solana) {
        console.log('Solana Config:', NETWORK_CONFIG.solana)
        console.log('✅ Solana config present')
    } else {
        console.error('❌ Solana config missing')
    }
}

testSolanaSupport()
