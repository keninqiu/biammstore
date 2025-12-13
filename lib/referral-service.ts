
import { prisma } from './db'
import { randomBytes } from 'crypto'

export const REFERRAL_COOKIE_NAME = 'ref_code'
export const REWARD_RATE = 0.05 // 5%
export const REWARD_LOCK_DAYS = 30

/**
 * Generates a unique referral code for a user
 */
export async function generateReferralCode(): Promise<string> {
    const code = randomBytes(4).toString('hex') // 8 char random string
    // Simple check (in production, might want a loop to ensure uniqueness)
    const existing = await prisma.user.findUnique({ where: { referralCode: code } })
    if (existing) return generateReferralCode()
    return code
}

/**
 * Assigns a referrer to a user if not already assigned
 */
export async function assignReferrer(userId: string, code: string) {
    if (!code) return

    const referrer = await prisma.user.findUnique({ where: { referralCode: code } })
    if (!referrer || referrer.id === userId) return // invalid or self-referral

    await prisma.user.update({
        where: { id: userId },
        data: { referrerId: referrer.id }
    })
}

/**
 * Processes a referral reward for a completed payment
 */
export async function processReferralReward(orderId: string) {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { user: true }
    })

    if (!order || !order.user.referrerId) return

    // Check if reward already exists
    const existing = await prisma.referralReward.findUnique({ where: { orderId } })
    if (existing) return

    const amount = order.totalUSD * REWARD_RATE
    const unlockDate = new Date()
    unlockDate.setDate(unlockDate.getDate() + REWARD_LOCK_DAYS)

    await prisma.referralReward.create({
        data: {
            referrerId: order.user.referrerId,
            orderId,
            amount,
            status: 'PENDING',
            unlockDate
        }
    })
}

/**
 * Cancels a reward if the order is refunded
 */
export async function cancelReferralReward(orderId: string) {
    const reward = await prisma.referralReward.findUnique({ where: { orderId } })
    if (!reward) return

    await prisma.referralReward.update({
        where: { id: reward.id },
        data: { status: 'CANCELED' }
    })
}

/**
 * Cron-like function to unlock available rewards
 * (Call this periodically or on dashboard load)
 */
export async function unlockRewards(referrerId: string) {
    await prisma.referralReward.updateMany({
        where: {
            referrerId,
            status: 'PENDING',
            unlockDate: { lte: new Date() }
        },
        data: { status: 'AVAILABLE' }
    })
}

/**
 * Get referral stats for dashboard
 */
export async function getReferralStats(referrerId: string) {
    const rewards = await prisma.referralReward.findMany({
        where: { referrerId }
    })

    const totalEarnings = rewards.reduce((sum: number, r: any) => sum + r.amount, 0)
    const available = rewards.filter((r: any) => r.status === 'AVAILABLE').reduce((sum: number, r: any) => sum + r.amount, 0)
    const pending = rewards.filter((r: any) => r.status === 'PENDING').reduce((sum: number, r: any) => sum + r.amount, 0)

    return {
        totalEarnings,
        available,
        pending,
        rewards
    }
}
