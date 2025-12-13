import prisma from '@/lib/db'
import bcrypt from 'bcrypt'

export async function createUser(data: {
    email: string
    password: string
    name: string
    role?: 'BUYER' | 'SELLER' | 'ADMIN'
    referrerCode?: string // Code from cookie
}) {
    // Check if user exists
    const existing = await prisma.user.findUnique({
        where: { email: data.email },
    })

    if (existing) {
        throw new Error('User already exists')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Generate own referral code
    let referralCode = ''
    try {
        const { generateReferralCode } = await import('./referral-service')
        referralCode = await generateReferralCode()
    } catch (e) {
        console.error("Failed to generate referral code", e)
    }

    // Resolve referrer if code provided
    let referrerId = undefined
    if (data.referrerCode) {
        const referrer = await prisma.user.findUnique({ where: { referralCode: data.referrerCode } })
        if (referrer) {
            referrerId = referrer.id
        }
    }

    // Create user
    const user = await prisma.user.create({
        data: {
            email: data.email,
            password: hashedPassword,
            name: data.name,
            role: data.role || 'BUYER',
            referralCode: referralCode || undefined,
            referrerId: referrerId
        },
    })

    // Return user without password
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
}

export async function verifyPassword(email: string, password: string) {
    const user = await prisma.user.findUnique({
        where: { email },
    })

    if (!user) {
        return null
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
        return null
    }

    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
}

export async function getUserById(id: string) {
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
        },
    })

    return user
}

export async function updateUser(id: string, data: { name?: string; email?: string }) {
    const user = await prisma.user.update({
        where: { id },
        data,
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
        },
    })

    return user
}
