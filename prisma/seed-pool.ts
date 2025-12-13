import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding Address Pool...')

    // Clear existing pool for test
    // await prisma.addressPool.deleteMany({})

    // Add a test USDT address
    await prisma.addressPool.create({
        data: {
            currency: 'USDT',
            network: 'ERC20',
            address: '0xPoolAddress1234567890TestUSDT',
            isUsed: false
        }
    })

    // Add a test BNB address
    await prisma.addressPool.create({
        data: {
            currency: 'BNB',
            network: 'Mainnet',
            address: '0xPoolAddressBNBTest123',
            isUsed: false
        }
    })

    console.log('Added 2 addresses to pool.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
