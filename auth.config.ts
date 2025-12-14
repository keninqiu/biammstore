// auth.config.ts
import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.role = (user as any).role
                token.id = user.id
            }
            if (trigger === "update" && session?.role) {
                token.role = session.role
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id
            }
            return session
        },
    },
    providers: [], // Providers that rely on Node.js (like bcrypt) go in auth.ts
} satisfies NextAuthConfig
