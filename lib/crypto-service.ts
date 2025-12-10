import { ethers } from 'ethers'
import prisma from '@/lib/db'
import {
    NETWORK_CONFIG,
    USDT_CONTRACTS,
    PAYMENT_TIMEOUT_MINUTES,
    MIN_PAYMENT_AMOUNTS,
    type CryptoCurrency,
} from '@/lib/crypto-config'
import { getBinancePrices } from '@/lib/binance-price-service'

// ERC-20 ABI for USDT (minimal interface)
const ERC20_ABI = [
    'function balanceOf(address account) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
]

/**
 * Get current cryptocurrency prices in USD using Binance free API
 */
export async function getCryptoPrices(): Promise<Record<CryptoCurrency, number>> {
    let prices: Record<string, number> | null = null;

    try {
        console.log('Fetching prices from Binance...')
        // Use Binance free API - no API key required!
        prices = await getBinancePrices()
        console.log('Prices fetched:', prices)
    } catch (error) {
        console.error('Error fetching crypto prices from Binance:', error)
    }

    // specific cache updating logic
    if (prices) {
        try {
            // Update cache in database
            for (const [currency, price] of Object.entries(prices)) {
                await prisma.cryptoPrice.upsert({
                    where: { currency },
                    update: { priceUSD: price },
                    create: { currency, priceUSD: price },
                })
            }
        } catch (dbError) {
            console.error('Failed to cache prices in database:', dbError)
            // Continue execution, don't fail just because cache update failed
        }

        return prices as Record<CryptoCurrency, number>
    }

    // If we're here, fetching failed. Try to get from cache.
    try {
        // Fallback to cached prices from database
        const cachedPrices = await prisma.cryptoPrice.findMany()
        const fallbackPrices: Record<string, number> = {}
        cachedPrices.forEach((cp) => {
            fallbackPrices[cp.currency] = cp.priceUSD
        })

        // If cache is empty, throw original error or default error
        if (Object.keys(fallbackPrices).length === 0) {
            throw new Error('No prices available (API failed and cache empty)')
        }

        return fallbackPrices as Record<CryptoCurrency, number>
    } catch (dbError) {
        console.error('Failed to retrieve cached prices:', dbError)
        throw new Error('Failed to retrieve crypto prices')
    }
}

/**
 * Calculate cryptocurrency amount from USD
 */
export async function calculateCryptoAmount(
    usdAmount: number,
    currency: CryptoCurrency
): Promise<number> {
    const prices = await getCryptoPrices()
    const price = prices[currency]

    if (!price || price === 0) {
        throw new Error(`Price not available for ${currency}`)
    }

    const amount = usdAmount / price

    // Check minimum amount
    if (amount < MIN_PAYMENT_AMOUNTS[currency]) {
        throw new Error(
            `Amount too small. Minimum ${MIN_PAYMENT_AMOUNTS[currency]} ${currency} required.`
        )
    }

    return amount
}

/**
 * Generate a payment address for an order
 * For MVP, we'll use the vendor's wallet address.
 */
async function generatePaymentAddress(orderId: string, currency: string, network?: string): Promise<string> {
    // 1. Get the order to find the vendor (via OrderItems -> Product -> Vendor)
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            items: {
                take: 1,
                include: {
                    product: {
                        include: {
                            vendor: {
                                include: {
                                    wallets: true
                                }
                            }
                        }
                    }
                }
            }
        }
    })

    if (!order || !order.items[0]) {
        throw new Error('Order not found or empty')
    }

    const vendor = order.items[0].product.vendor
    const wallet = vendor.wallets.find(w => w.currency === currency && (!network || w.network === network))

    if (!wallet) {
        // Fallback: try to find ANY wallet for this currency if network specific one is missing
        const fallbackWallet = vendor.wallets.find(w => w.currency === currency)
        if (fallbackWallet) {
            console.warn(`No wallet found for ${currency} on ${network}, utilizing fallback ${fallbackWallet.network}`)
            return fallbackWallet.address
        }

        throw new Error(`Vendor ${vendor.storeName} does not have a configured wallet for ${currency} ${network ? `on ${network}` : ''}`)
    }

    return wallet.address
}

/**
 * Monitor Ethereum/BSC transaction
 */
export async function checkEthTransaction(
    txHash: string,
    network: 'ethereum' | 'bsc'
): Promise<{
    confirmed: boolean
    confirmations: number
    amount: number
    to: string
}> {
    const config = network === 'ethereum' ? NETWORK_CONFIG.ethereum : NETWORK_CONFIG.bsc
    const provider = new ethers.JsonRpcProvider(config.rpcUrl)

    try {
        const tx = await provider.getTransaction(txHash)
        if (!tx) {
            throw new Error('Transaction not found')
        }

        const receipt = await provider.getTransactionReceipt(txHash)
        if (!receipt) {
            return {
                confirmed: false,
                confirmations: 0,
                amount: parseFloat(ethers.formatEther(tx.value)),
                to: tx.to || '',
            }
        }

        const currentBlock = await provider.getBlockNumber()
        const confirmations = currentBlock - receipt.blockNumber + 1

        return {
            confirmed: confirmations >= config.requiredConfirmations,
            confirmations,
            amount: parseFloat(ethers.formatEther(tx.value)),
            to: tx.to || '',
        }
    } catch (error) {
        console.error(`Error checking ${network} transaction:`, error)
        throw error
    }
}

/**
 * Check USDT transaction (ERC-20)
 */
export async function checkUSDTTransaction(
    txHash: string,
    network: 'ethereum' | 'bsc'
): Promise<{
    confirmed: boolean
    confirmations: number
    amount: number
    to: string
}> {
    const config = network === 'ethereum' ? NETWORK_CONFIG.ethereum : NETWORK_CONFIG.bsc
    const provider = new ethers.JsonRpcProvider(config.rpcUrl)

    try {
        const receipt = await provider.getTransactionReceipt(txHash)
        if (!receipt) {
            return {
                confirmed: false,
                confirmations: 0,
                amount: 0,
                to: '',
            }
        }

        const currentBlock = await provider.getBlockNumber()
        const confirmations = currentBlock - receipt.blockNumber + 1

        // Parse transfer event from logs
        const usdtContract =
            network === 'ethereum' ? USDT_CONTRACTS.ethereum : USDT_CONTRACTS.bsc
        const iface = new ethers.Interface(ERC20_ABI)

        let amount = 0
        let to = ''

        for (const log of receipt.logs) {
            if (log.address.toLowerCase() === usdtContract.toLowerCase()) {
                try {
                    const parsed = iface.parseLog({
                        topics: log.topics as string[],
                        data: log.data,
                    })
                    if (parsed && parsed.name === 'Transfer') {
                        // USDT has 6 decimals
                        amount = parseFloat(parsed.args[1].toString()) / 1e6
                        to = parsed.args[0]
                    }
                } catch (e) {
                    // Not a transfer event
                }
            }
        }

        return {
            confirmed: confirmations >= config.requiredConfirmations,
            confirmations,
            amount,
            to,
        }
    } catch (error) {
        console.error(`Error checking USDT transaction:`, error)
        throw error
    }
}

/**
 * Check Bitcoin transaction
 */
export async function checkBTCTransaction(txHash: string): Promise<{
    confirmed: boolean
    confirmations: number
    amount: number
    to: string
}> {
    try {
        const response = await fetch(`${NETWORK_CONFIG.bitcoin.apiUrl}/tx/${txHash}`)
        const tx = await response.json()

        if (!tx) {
            throw new Error('Transaction not found')
        }

        const confirmations = tx.status?.confirmed ? tx.status.block_height : 0

        // Calculate total output amount (simplified - just take first output)
        const amount = tx.vout?.[0]?.value ? tx.vout[0].value / 1e8 : 0
        const to = tx.vout?.[0]?.scriptpubkey_address || ''

        return {
            confirmed: confirmations >= NETWORK_CONFIG.bitcoin.requiredConfirmations,
            confirmations,
            amount,
            to,
        }
    } catch (error) {
        console.error('Error checking BTC transaction:', error)
        throw error
    }
}


/**
 * Check Solana transaction
 */
export async function checkSolanaTransaction(txHash: string): Promise<{
    confirmed: boolean
    confirmations: number
    amount: number
    to: string
}> {
    const { Connection } = await import('@solana/web3.js')
    const connection = new Connection(NETWORK_CONFIG.solana.rpcUrl, 'confirmed')

    try {
        const tx = await connection.getParsedTransaction(txHash, {
            maxSupportedTransactionVersion: 0
        })

        if (!tx) {
            throw new Error('Transaction not found')
        }

        // Check confirmations
        // In Solana, if we get the tx with 'confirmed' commitment, it's effectively confirmed enough for most.
        // But we can check slot difference if needed. For simplicity we assume if it exists and is recent, it is confirmed.
        let confirmations = 0
        if (tx.slot) {
            const currentSlot = await connection.getSlot()
            confirmations = currentSlot - tx.slot
        }

        // Parse amount and recipient
        // This is complex for Solana as transfer instructions can vary (system transfer vs SPL token)
        // For native SOL transfer:
        let amount = 0
        let to = ''

        // Look for System Program Transfer
        const instructions = tx.transaction.message.instructions
        for (const ix of instructions) {
            // This is a simplified check. Real implementation needs robust parsing of SystemProgram.transfer
            // We'll rely on pre/post balances which is safer for SOL transfers
            if ('parsed' in ix && ix.program === 'system' && ix.parsed.type === 'transfer') {
                const info = ix.parsed.info
                amount = info.lamports / 1e9 // 1 SOL = 1e9 lamports
                to = info.destination
                break
            }
        }

        // If simple instruction parsing failed (maybe it's a complex tx), try balance changes
        if (amount === 0 && tx.meta?.postBalances && tx.meta.preBalances) {
            // Identify which account received money.
            // This is tricky without knowing the specific wallet index. 
            // For MVP, we'll assume the instruction parsing works for standard transfers.
        }

        return {
            confirmed: confirmations >= NETWORK_CONFIG.solana.requiredConfirmations,
            confirmations,
            amount,
            to,
        }

    } catch (error) {
        console.error('Error checking Solana transaction:', error)
        throw error
    }
}

/**
 * Verify payment for an order
 */
export async function verifyPayment(paymentId: string, txHash: string): Promise<boolean> {
    const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { order: true },
    })

    if (!payment) {
        throw new Error('Payment not found')
    }

    let txInfo: { confirmed: boolean; confirmations: number; amount: number; to: string }

    // Check transaction based on currency
    switch (payment.currency) {
        case 'ETH':
            txInfo = await checkEthTransaction(txHash, 'ethereum')
            break

        case 'BNB':
            txInfo = await checkEthTransaction(txHash, 'bsc')
            break

        case 'USDT':
            // For USDT, we need to determine which network (default to Ethereum)
            // Ideally we check payment.network but defaulting to ethereum for simplicity if not set
            const network = payment.network === 'TRC20' ? 'ethereum' : (payment.network === 'BSC' ? 'bsc' : 'ethereum')
            // Note: TRC20 check logic would need real TRON implementation, assuming ERC20/BEP20 logic for now
            txInfo = await checkUSDTTransaction(txHash, network as 'ethereum' | 'bsc')
            break

        case 'BTC':
            txInfo = await checkBTCTransaction(txHash)
            break

        case 'SOL':
            txInfo = await checkSolanaTransaction(txHash)
            break

        default:
            throw new Error(`Unsupported currency: ${payment.currency}`)
    }

    // Verify payment address matches
    if (txInfo.to.toLowerCase() !== payment.paymentAddress.toLowerCase()) {
        throw new Error('Payment address mismatch')
    }

    // Verify amount (with 1% tolerance for fees/rounding)
    const tolerance = payment.amount * 0.01
    if (Math.abs(txInfo.amount - payment.amount) > tolerance) {
        throw new Error(`Amount mismatch. Expected ${payment.amount}, got ${txInfo.amount}`)
    }

    // Update blockchain transaction record
    await prisma.blockchainTransaction.upsert({
        where: { txHash },
        update: {
            confirmations: txInfo.confirmations,
            status: txInfo.confirmed ? 'CONFIRMED' : 'PENDING',
        },
        create: {
            paymentId: payment.id,
            txHash,
            network: payment.currency === 'BTC' ? 'bitcoin' : payment.currency === 'BNB' ? 'bsc' : (payment.currency === 'SOL' ? 'solana' : 'ethereum'),
            amount: txInfo.amount,
            confirmations: txInfo.confirmations,
            status: txInfo.confirmed ? 'CONFIRMED' : 'PENDING',
        },
    })

    // Update payment status
    if (txInfo.confirmed) {
        await prisma.payment.update({
            where: { id: paymentId },
            data: { status: 'CONFIRMED' },
        })

        // Update order status
        await prisma.order.update({
            where: { id: payment.orderId },
            data: { status: 'PAID' },
        })

        return true
    } else {
        await prisma.payment.update({
            where: { id: paymentId },
            data: { status: 'CONFIRMING' },
        })

        await prisma.order.update({
            where: { id: payment.orderId },
            data: { status: 'PAYMENT_CONFIRMING' },
        })

        return false
    }
}

/**
 * Create a payment for an order
 */
export async function createPayment(orderId: string, currency: CryptoCurrency, network: string, amountUSD?: number) {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
    })

    if (!order) {
        throw new Error('Order not found')
    }

    const usdTotal = amountUSD || order.totalUSD

    // Calculate crypto amount
    const cryptoAmount = await calculateCryptoAmount(usdTotal, currency)

    // Generate payment address
    const paymentAddress = await generatePaymentAddress(orderId, currency, network)

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + PAYMENT_TIMEOUT_MINUTES * 60 * 1000)

    // Create payment
    const payment = await prisma.payment.create({
        data: {
            orderId,
            currency,
            network,
            amount: cryptoAmount,
            paymentAddress,
            status: 'PENDING',
            expiresAt,
        },
    })

    // Update order with crypto details
    await prisma.order.update({
        where: { id: orderId },
        data: {
            currency,
            cryptoAmount,
            network
        },
    })

    return payment
}
