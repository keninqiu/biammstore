import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const response = NextResponse.next()

    // 1. Referral Logic
    const refCode = req.nextUrl.searchParams.get('ref')
    if (refCode) {
        response.cookies.set('ref_code', refCode, {
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            httpOnly: true,
            sameSite: 'lax'
        })
    }

    // 2. Auth Protection Logic
    const isLoggedIn = !!req.auth
    const { pathname } = req.nextUrl
    const userRole = (req.auth?.user as any)?.role

    // Protect Admin Routes
    if (pathname.startsWith('/admin')) {
        if (!isLoggedIn) return NextResponse.redirect(new URL('/login', req.url))
        if (userRole !== 'ADMIN') return NextResponse.redirect(new URL('/', req.url)) // Or unauthorized page
    }

    // Protect Vendor Routes
    if (pathname.startsWith('/vendor')) {
        // Allow /vendor/register for logged in users (even buyers) to become vendors?
        // Or strictly for sellers. Let's say /vendor/dashboard is protected.
        if (pathname.startsWith('/vendor/dashboard')) {
            if (!isLoggedIn) return NextResponse.redirect(new URL('/login', req.url))
            if (userRole !== 'SELLER' && userRole !== 'ADMIN') return NextResponse.redirect(new URL('/vendor/register', req.url))
        }
        // /vendor/register requires login at least
        if (pathname.startsWith('/vendor/register')) {
            if (!isLoggedIn) return NextResponse.redirect(new URL('/login', req.url))
        }
    }

    return response
})

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
