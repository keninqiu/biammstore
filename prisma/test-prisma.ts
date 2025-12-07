import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL
})

async function main() {
    console.log('Testing Prisma connection...')
    await prisma.$connect()
    console.log('Connected!')
    const count = await prisma.user.count()
    console.log('User count:', count)
    await prisma.$disconnect()
}

main().catch(console.error)
