import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

console.log('Testing minimal connection')
const url = process.env.DATABASE_URL
if (!url) {
    console.error('No DATABASE_URL found')
    process.exit(1)
}

let prisma;
try {
    prisma = new PrismaClient({
        datasources: {
            db: {
                url: url
            }
        }
    })
    console.log('Prisma Client initialized')
} catch (e) {
    console.error('Constructor Error:', e)
    process.exit(1)
}

async function main() {
    console.log('Connecting...')
    await prisma.$connect()
    console.log('Connected!')
    const count = await prisma.user.count()
    console.log('User count:', count)
}

main()
    .catch(e => {
        console.error('Error:', e)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
