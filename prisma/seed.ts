import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const url = process.env.DATABASE_URL
console.log('DEBUG: DATABASE_URL is', url ? 'defined' : 'undefined')
if (url) console.log('DEBUG: DATABASE_URL starts with', url.substring(0, 10))

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting database seed...')

    // Create sample categories
    console.log('Creating categories...')
    const electronics = await prisma.category.upsert({
        where: { slug: 'electronics' },
        update: {},
        create: {
            name: 'Electronics',
            slug: 'electronics',
            order: 1,
        },
    })

    const fashion = await prisma.category.upsert({
        where: { slug: 'fashion' },
        update: {},
        create: {
            name: 'Fashion',
            slug: 'fashion',
            order: 2,
        },
    })

    const home = await prisma.category.upsert({
        where: { slug: 'home' },
        update: {},
        create: {
            name: 'Home & Garden',
            slug: 'home',
            order: 3,
        },
    })

    // Create sample users
    console.log('Creating users...')
    const buyer = await prisma.user.upsert({
        where: { email: 'buyer@example.com' },
        update: {},
        create: {
            email: 'buyer@example.com',
            password: await bcrypt.hash('password123', 10),
            name: 'John Buyer',
            role: 'BUYER',
        },
    })

    const seller1 = await prisma.user.upsert({
        where: { email: 'vendor1@example.com' },
        update: {},
        create: {
            email: 'vendor1@example.com',
            password: await bcrypt.hash('password123', 10),
            name: 'Vendor One',
            role: 'SELLER',
        },
    })

    const seller2 = await prisma.user.upsert({
        where: { email: 'vendor2@example.com' },
        update: {},
        create: {
            email: 'vendor2@example.com',
            password: await bcrypt.hash('password123', 10),
            name: 'Vendor Two',
            role: 'SELLER',
        },
    })

    // Create vendors
    console.log('Creating vendors...')
    const vendor1 = await prisma.vendor.upsert({
        where: { userId: seller1.id },
        update: {},
        create: {
            userId: seller1.id,
            storeName: 'Tech Haven',
            description: 'Your one-stop shop for all things tech',
            status: 'APPROVED',
            rating: 4.8
        },
    })

    const vendor2 = await prisma.vendor.upsert({
        where: { userId: seller2.id },
        update: {},
        create: {
            userId: seller2.id,
            storeName: 'Fashion Forward',
            description: 'Trendy fashion at affordable prices',
            status: 'APPROVED',
            rating: 4.5
        },
    })

    // Create Wallets for Vendors
    // Using simple upserts to avoid duplicates on re-seed
    await prisma.vendorWallet.deleteMany({ where: { vendorId: { in: [vendor1.id, vendor2.id] } } })

    // Vendor 1 Wallets
    await prisma.vendorWallet.create({
        data: { vendorId: vendor1.id, currency: 'BTC', network: 'Bitcoin', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' }
    })
    await prisma.vendorWallet.create({
        data: { vendorId: vendor1.id, currency: 'ETH', network: 'Ethereum', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' }
    })
    await prisma.vendorWallet.create({
        data: { vendorId: vendor1.id, currency: 'USDT', network: 'ERC20', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' }
    })
    await prisma.vendorWallet.create({
        data: { vendorId: vendor1.id, currency: 'USDT', network: 'TRC20', address: 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb' }
    })
    await prisma.vendorWallet.create({
        data: { vendorId: vendor1.id, currency: 'SOL', network: 'Solana', address: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH' }
    })

    // Vendor 2 Wallets
    await prisma.vendorWallet.create({
        data: { vendorId: vendor2.id, currency: 'BNB', network: 'BSC', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' }
    })
    await prisma.vendorWallet.create({
        data: { vendorId: vendor2.id, currency: 'USDT', network: 'BEP20', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' }
    })
    await prisma.vendorWallet.create({
        data: { vendorId: vendor2.id, currency: 'SOL', network: 'Solana', address: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH' }
    })

    // Create sample products
    console.log('Creating products...')
    await prisma.product.createMany({
        data: [
            {
                vendorId: vendor1.id,
                categoryId: electronics.id,
                name: 'Wireless Headphones',
                description: 'Premium noise-cancelling wireless headphones with 30-hour battery life',
                priceUSD: 199.99,
                stock: 50,
                status: 'ACTIVE',
            },
            {
                vendorId: vendor1.id,
                categoryId: electronics.id,
                name: 'Smart Watch',
                description: 'Feature-rich smartwatch with health tracking and notifications',
                priceUSD: 299.99,
                stock: 30,
                status: 'ACTIVE',
            },
            {
                vendorId: vendor1.id,
                categoryId: electronics.id,
                name: 'USB-C Hub',
                description: '7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader',
                priceUSD: 49.99,
                stock: 100,
                status: 'ACTIVE',
            },
            {
                vendorId: vendor2.id,
                categoryId: fashion.id,
                name: 'Designer Sunglasses',
                description: 'Stylish UV-protected sunglasses with polarized lenses',
                priceUSD: 89.99,
                stock: 75,
                status: 'ACTIVE',
            },
            {
                vendorId: vendor2.id,
                categoryId: fashion.id,
                name: 'Leather Wallet',
                description: 'Genuine leather bifold wallet with RFID protection',
                priceUSD: 39.99,
                stock: 120,
                status: 'ACTIVE',
            },
            {
                vendorId: vendor2.id,
                categoryId: fashion.id,
                name: 'Canvas Backpack',
                description: 'Durable canvas backpack with laptop compartment',
                priceUSD: 69.99,
                stock: 60,
                status: 'ACTIVE',
            },
        ],
        skipDuplicates: true
    })

    // Initialize crypto prices
    console.log('Initializing crypto prices...')
    await prisma.cryptoPrice.createMany({
        data: [
            { currency: 'BTC', priceUSD: 42000 },
            { currency: 'ETH', priceUSD: 2200 },
            { currency: 'USDT', priceUSD: 1 },
            { currency: 'BNB', priceUSD: 310 },
            { currency: 'SOL', priceUSD: 70 },
        ],
        skipDuplicates: true,
    })

    console.log('✅ Database seeded successfully!')
    console.log('\n📝 Test Accounts:')
    console.log('Buyer: buyer@example.com / password123')
    console.log('Vendor 1: vendor1@example.com / password123')
    console.log('Vendor 2: vendor2@example.com / password123')
}

main()
    .catch((e) => {
        console.error('Error seeding database:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
