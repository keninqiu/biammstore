
import { NETWORK_CONFIG } from './crypto-config'

async function testSolanaLib() {
    console.log('Testing Solana Library Import...')

    try {
        const { Connection } = await import('@solana/web3.js')
        console.log('✅ Library imported successfully')

        console.log(`Connecting to ${NETWORK_CONFIG.solana.rpcUrl}...`)
        const connection = new Connection(NETWORK_CONFIG.solana.rpcUrl, 'confirmed')

        const version = await connection.getVersion()
        console.log('✅ Connection established. Node Version:', version)

    } catch (error) {
        console.error('❌ Solana library test failed:', error)
        process.exit(1)
    }
}

testSolanaLib()
