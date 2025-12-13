import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const response = NextResponse.next()

    // Check for referral code in URL
    const refCode = request.nextUrl.searchParams.get('ref')

    if (refCode) {
        // Set cookie for 30 days
        response.cookies.set('ref_code', refCode, {
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            httpOnly: true, // Secure, backend only
            sameSite: 'lax'
        })
    }

    return response
}

export const config = {
    matcher: [
        // Match all request paths except for the ones starting with:
        // - api (API routes)
        // - _next/static (static files)
        // - _next/image (image optimization files)
        // - favicon.ico (favicon file)
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
