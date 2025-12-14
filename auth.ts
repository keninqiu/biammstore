import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { verifyPassword } from "@/lib/user-service"
import { z } from "zod"
import { authConfig } from "./auth.config"

// Add type augmentation in a separate file or here if possible, but separate is cleaner. 
// For now, casting is used in auth.ts callbacks.

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const parsed = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials)

                if (parsed.success) {
                    const { email, password } = parsed.data
                    const user = await verifyPassword(email, password)
                    if (!user) return null

                    // Return user object compatible with NextAuth User type
                    // We need to ensure we return 'id' and other necessary fields
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role, // Custom field, will need type augmentation
                    }
                }

                return null
            },
        }),
    ],
})
