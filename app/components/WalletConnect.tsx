"use client"

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

type Props = {
    amount: number
    currency: string
    network: string
    paymentAddress: string
    onSuccess?: (txHash: string) => void
}

const NETWORK_PARAMS: Record<string, any> = {
    'BNB': {
        chainId: '0x38', // 56
        chainName: 'BNB Smart Chain',
        nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
        rpcUrls: ['https://bsc-dataseed.binance.org/'],
        blockExplorerUrls: ['https://bscscan.com/']
    },
    'ETH': {
        chainId: '0x1', // 1
        chainName: 'Ethereum Mainnet',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://mainnet.infura.io/v3/'],
        blockExplorerUrls: ['https://etherscan.io/']
    }
    // USDT/USDC usually resort to the underlying chain (ETH or BNB default if not strict)
    // We'll handle network check loosely for MVP
}

export default function WalletConnect({ amount, currency, network, paymentAddress, onSuccess }: Props) {
    const [account, setAccount] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [txHash, setTxHash] = useState('')

    // Check if wallet is connected on mount
    useEffect(() => {
        // Suppress buggy extension errors (Phantom Wallet)
        const handleGlobalError = (event: ErrorEvent) => {
            if (event.message?.includes('chrome.runtime.sendMessage') || event.message?.includes('Extension ID')) {
                event.preventDefault();
                event.stopPropagation();
                console.warn("Suppressed extension error:", event.message);
            }
        };
        const handleRejection = (event: PromiseRejectionEvent) => {
            if (event.reason?.message?.includes('chrome.runtime.sendMessage') || event.reason?.message?.includes('Extension ID')) {
                event.preventDefault();
                event.stopPropagation();
                console.warn("Suppressed extension promise rejection:", event.reason);
            }
        }

        window.addEventListener('error', handleGlobalError);
        window.addEventListener('unhandledrejection', handleRejection);

        const checkConnection = async () => {
            try {
                if (typeof window !== 'undefined' && (window as any).ethereum) {
                    const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' })
                        .catch((err: any) => {
                            console.warn("Simple wallet detection failed:", err)
                            return []
                        })

                    if (accounts && accounts.length > 0) {
                        setAccount(accounts[0])
                    }
                }
            } catch (err) {
                console.warn("Wallet provider error:", err)
            }
        }

        checkConnection()

        return () => {
            window.removeEventListener('error', handleGlobalError);
            window.removeEventListener('unhandledrejection', handleRejection);
        }
    }, [])

    const connectWallet = async () => {
        setLoading(true)
        setError('')
        try {
            if (typeof window === 'undefined' || !(window as any).ethereum) {
                throw new Error('No crypto wallet found. Please install MetaMask.')
            }

            const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
            setAccount(accounts[0])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to connect')
        } finally {
            setLoading(false)
        }
    }

    const pay = async () => {
        setLoading(true)
        setError('')
        try {
            if (!account) return

            const provider = new ethers.BrowserProvider((window as any).ethereum)
            const signer = await provider.getSigner()

            // Switch Network if needed (Simple check for BNB, hard to enforce for generic "ERC20" without knowing underlying chain intent perfectly)
            // For MVP, we'll try to suggest BNB if currency is BNB.
            if (currency === 'BNB' && NETWORK_PARAMS['BNB']) {
                try {
                    await (window as any).ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: NETWORK_PARAMS['BNB'].chainId }],
                    })
                } catch (switchError: any) {
                    // This error code indicates that the chain has not been added to MetaMask.
                    if (switchError.code === 4902) {
                        await (window as any).ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [NETWORK_PARAMS['BNB']],
                        })
                    }
                }
            }

            // Create Transaction
            let tx

            // Native Token Transfer (ETH, BNB)
            if (['ETH', 'BNB'].includes(currency)) {
                tx = await signer.sendTransaction({
                    to: paymentAddress,
                    value: ethers.parseEther(amount.toString())
                })
            }
            // ERC20 Token Transfer (USDT, USDC)
            else if (['USDT', 'USDC'].includes(currency)) {
                // Minimal ERC20 ABI
                const ERC20_ABI = [
                    "function transfer(address to, uint256 value) public returns (bool)",
                    "function decimals() view returns (uint8)",
                    "function balanceOf(address owner) view returns (uint256)"
                ];

                // Token Contract Map (Mock/Real addresses)
                // NOTE: In a real app, you'd want a comprehensive list or a token list API.
                // Using standard mainnet addresses for demo purposes.
                const TOKEN_CONTRACTS: Record<string, Record<string, string>> = {
                    '0x1': { // Ethereum Mainnet
                        'USDT': '0xdac17f958d2ee523a2206206994597c13d831ec7',
                        'USDC': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
                    },
                    '0x38': { // BNB Smart Chain
                        'USDT': '0x55d398326f99059ff775485246999027b3197955',
                        'USDC': '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'
                    }
                };

                const chainId = (await provider.getNetwork()).chainId.toString(16);
                const normalizedChainId = '0x' + chainId.replace('0x', '');

                const tokenAddress = TOKEN_CONTRACTS[normalizedChainId]?.[currency];

                if (!tokenAddress) {
                    throw new Error(`Token ${currency} not found for this network (Chain ID: ${normalizedChainId}). Please select the correct network in your wallet.`);
                }

                const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

                // Fetch decimals dynamically
                const decimals = await tokenContract.decimals();
                const parsedAmount = ethers.parseUnits(amount.toString(), decimals);

                // Check Token Balance
                const balance = await tokenContract.balanceOf(account);
                if (balance < parsedAmount) {
                    throw new Error(`Insufficient ${currency} balance. You have ${ethers.formatUnits(balance, decimals)} but need ${amount}.`);
                }

                // Check Gas Balance (Native)
                const nativeBalance = await provider.getBalance(account);
                if (nativeBalance === BigInt(0)) {
                    throw new Error(`Insufficient ${NETWORK_PARAMS[normalizedChainId === '0x38' ? 'BNB' : 'ETH']?.nativeCurrency?.symbol || 'Native Currency'} for gas fees.`);
                }

                tx = await tokenContract.transfer(paymentAddress, parsedAmount);
            } else {
                throw new Error(`Unsupported currency for auto-connect: ${currency}`)
            }

            setTxHash(tx.hash)
            if (onSuccess) onSuccess(tx.hash)

        } catch (err) {
            console.error(err)
            setError(err instanceof Error ? err.message : 'Transaction failed')
        } finally {
            setLoading(false)
        }
    }

    if (txHash) {
        return (
            <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <div className="text-green-600 dark:text-green-400 text-5xl mb-4">✓</div>
                <h3 className="text-xl font-bold text-green-700 dark:text-green-300 mb-2">Transaction Sent!</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 break-all">
                    Hash: {txHash}
                </p>
                <p className="text-xs text-gray-500">
                    Your payment is confirming. Status will update shortly.
                </p>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                🔗
            </div>
            <h3 className="text-xl font-bold mb-2">Connect Wallet</h3>
            <p className="text-gray-500 mb-6">
                {account
                    ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`
                    : `Connect your Web3 wallet to pay ${amount} ${currency}`
                }
            </p>

            {error && (
                <div className="mb-4 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    {error}
                </div>
            )}

            {!account ? (
                <button
                    onClick={connectWallet}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    {loading ? 'Connecting...' : 'Connect MetaMask'}
                </button>
            ) : (
                <button
                    onClick={pay}
                    disabled={loading}
                    className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                    {loading ? 'Processing...' : `Pay ${amount} ${currency}`}
                </button>
            )}

            {currency === 'SOL' && (
                <p className="mt-4 text-xs text-amber-500">
                    Note: Solana support requires a different wallet adapter. Please use Direct Transfer for SOL.
                </p>
            )}
        </div>
    )
}
