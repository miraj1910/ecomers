import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

function debug(...args: unknown[]) {
  if (process.env.NODE_ENV === "development" || process.env.AUTH_DEBUG) {
    console.log("[auth]", ...args)
  }
}

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error(
    "[auth] MISSING GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET env vars"
  )
}
if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
  console.error(
    "[auth] MISSING AUTH_SECRET or NEXTAUTH_SECRET env var"
  )
}

debug("GOOGLE_CLIENT_ID set:", !!process.env.GOOGLE_CLIENT_ID)
debug("GOOGLE_CLIENT_SECRET set:", !!process.env.GOOGLE_CLIENT_SECRET)
debug("AUTH_SECRET set:", !!process.env.AUTH_SECRET)
debug("NEXTAUTH_SECRET set:", !!process.env.NEXTAUTH_SECRET)
debug("NEXTAUTH_URL:", process.env.NEXTAUTH_URL)
debug("AUTH_URL:", process.env.AUTH_URL)

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
        select: { status: true, deletedAt: true },
      })
      if (dbUser?.deletedAt) return false
      if (dbUser?.status === "BLOCKED") return false
      return true
    },
    async session({ session, user }) {
      if (user) {
        session.user.id = user.id
        const role = "role" in user ? (user as { role: "CUSTOMER" | "ADMIN" }).role : undefined
        session.user.role = role ?? "CUSTOMER"
      }
      return session
    },
  },
  trustHost: true,
})
