
import { prisma } from '@/lib/db'
import { createPayment } from '@/lib/crypto-service'

async function main() {
    console.log('🧪 Testing HD Wallet Derivation...')

    // 1. Get Vendor 1 (who has xpubs)
    const vendor = await prisma.vendor.findFirst({
        where: { storeName: 'Tech Haven' },
        include: { wallets: true }
    })

    if (!vendor) throw new Error('Vendor not found')
    console.log(`Vendor: ${vendor.storeName}`)

    // 2. Create a dummy order for Vendor 1 product (Headphones)
    const product = await prisma.product.findFirst({
        where: { vendorId: vendor.id }
    })
    if (!product) throw new Error('Product not found')

    // Create a user if not exists
    const user = await prisma.user.findUnique({
        where: { email: 'buyer@example.com' }
    })

    // Create address if not exists
    const address = await prisma.address.create({
        data: {
            userId: user!.id,
            fullName: 'Test User',
            addressLine: '123 Test St',
            city: 'Test City',
            country: 'Test Country',
            postalCode: '12345',
            phone: '1234567890'
        }
    })

    const order = await prisma.order.create({
        data: {
            userId: user!.id,
            status: 'PENDING_PAYMENT',
            totalUSD: 100,
            currency: 'BTC',
            network: 'Bitcoin',
            cryptoAmount: 0,
            addressId: address.id,
            items: {
                create: [{
                    productId: product.id,
                    quantity: 1,
                    priceUSD: 100
                }]
            }
        }
    })
    console.log(`Order created: ${order.id}`)

    // 3. Create Payment (BTC) -> Should trigger derivation index 1 (since 0 is start)
    console.log('Generating BTC Payment...')
    const payment = await createPayment(order.id, 'BTC', 'Bitcoin')
    console.log(`BTC Derived Address (Index 1?): ${payment.paymentAddress}`)

    // Check wallet index
    const wallet = await prisma.vendorWallet.findUnique({
        where: { id: vendor.wallets.find(w => w.currency === 'BTC')!.id }
    })
    console.log(`Wallet Last Index: ${wallet!.lastIndex} (Expected incremented)`)

    // 4. Create another payment (ETH) -> Should derive
    console.log('Generating ETH Payment...')
    const orderETH = await prisma.order.create({
        data: {
            userId: user!.id,
            status: 'PENDING_PAYMENT',
            totalUSD: 100,
            currency: 'ETH',
            network: 'Ethereum',
            cryptoAmount: 0,
            addressId: address.id,
            items: {
                create: [{
                    productId: product.id,
                    quantity: 1,
                    priceUSD: 100
                }]
            }
        }
    })

    const paymentETH = await createPayment(orderETH.id, 'ETH', 'Ethereum')
    console.log(`ETH Derived Address: ${paymentETH.paymentAddress}`)

    console.log('✅ Verification Complete')
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect())
