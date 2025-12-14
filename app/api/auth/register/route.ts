import { NextResponse } from 'next/server'
import { createUser } from '@/lib/user-service'
import { z } from 'zod'
import { cookies } from 'next/headers'

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
})

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, email, password } = registerSchema.parse(body)

        // Get referral code from cookie
        const cookieStore = await cookies()
        const referralCode = cookieStore.get('ref_code')?.value

        const user = await createUser({
            name,
            email,
            password,
            referrerCode: referralCode
        })

        return NextResponse.json({ user })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Registration failed' },
            { status: 400 }
        )
    }
}
