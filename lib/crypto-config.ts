export const SUPPORTED_CURRENCIES = ['BTC', 'ETH', 'USDT', 'BNB'] as const
export type CryptoCurrency = typeof SUPPORTED_CURRENCIES[number]

// Supported networks for each currency
export const SUPPORTED_NETWORKS: Record<CryptoCurrency, string[]> = {
    BTC: ['Bitcoin', 'Lightning'],
    ETH: ['Ethereum', 'Arbitrum', 'Optimism'],
    USDT: ['ERC20', 'TRC20', 'BEP20'],
    BNB: ['BSC']
}

export const NETWORK_CONFIG = {
    ethereum: {
        name: 'Ethereum',
        chainId: 1,
        rpcUrl: process.env.NEXT_PUBLIC_ETH_RPC_URL || 'https://mainnet.infura.io/v3/YOUR-PROJECT-ID',
        explorer: 'https://etherscan.io',
        requiredConfirmations: parseInt(process.env.NEXT_PUBLIC_REQUIRED_CONFIRMATIONS_ETH || '12'),
    },
    bsc: {
        name: 'BSC',
        chainId: 56,
        rpcUrl: process.env.NEXT_PUBLIC_BSC_RPC_URL || 'https://bsc-dataseed.binance.org/',
        explorer: 'https://bscscan.com',
        requiredConfirmations: parseInt(process.env.NEXT_PUBLIC_REQUIRED_CONFIRMATIONS_BSC || '20'),
    },
    bitcoin: {
        name: 'Bitcoin',
        apiUrl: process.env.NEXT_PUBLIC_BTC_API_URL || 'https://blockstream.info/api',
        explorer: 'https://blockstream.info',
        requiredConfirmations: parseInt(process.env.NEXT_PUBLIC_REQUIRED_CONFIRMATIONS_BTC || '3'),
    },
}

// USDT Contract addresses
export const USDT_CONTRACTS = {
    ethereum: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT on Ethereum (ERC-20)
    bsc: '0x55d398326f99059fF775485246999027B3197955', // USDT on BSC (BEP-20)
    // TRC20 contract would be needed for TRON integration in real implementation
}

// Payment timeout in minutes
export const PAYMENT_TIMEOUT_MINUTES = parseInt(
    process.env.NEXT_PUBLIC_PAYMENT_TIMEOUT_MINUTES || '30'
)

// Minimum amounts for each currency (to avoid dust transactions)
export const MIN_PAYMENT_AMOUNTS: Record<CryptoCurrency, number> = {
    BTC: 0.0001, // ~$4 at $40k
    ETH: 0.001, // ~$2 at $2k
    USDT: 1, // $1
    BNB: 0.01, // ~$5 at $500
}
