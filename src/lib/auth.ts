import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

function debug(...args: unknown[]) {
  if (process.env.NODE_ENV === "development" || process.env.AUTH_DEBUG) {
    console.log("[auth]", ...args)
  }
}

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
  logger: {
    error(error) {
      console.error("[auth/logger/error]", error instanceof Error ? error.stack || error.message : error)
    },
    warn(code) {
      console.warn("[auth/logger/warn]", code)
    },
    debug(message, metadata) {
      if (process.env.NODE_ENV === "development" || process.env.AUTH_DEBUG) {
        console.log("[auth/logger/debug]", message, metadata ?? "")
      }
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      debug("signIn callback invoked", { email: user.email, provider: account?.provider })
      if (!user.email) {
        debug("signIn: no email, denying")
        return false
      }
      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { status: true, deletedAt: true, role: true },
        })
        if (dbUser?.deletedAt) {
          debug("signIn: user deleted, denying", user.email)
          return false
        }
        if (dbUser?.status === "BLOCKED") {
          debug("signIn: user blocked, denying", user.email)
          return false
        }
        debug("signIn: user authorized", { email: user.email, role: dbUser?.role })
        return true
      } catch (e) {
        console.error("[auth/signIn] Database error in signIn callback:", e)
        return false
      }
    },
    async session({ session, user }) {
      if (user?.id) {
        session.user.id = user.id
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true },
          })
          if (dbUser) {
            session.user.role = dbUser.role
          }
          debug("session callback: role from direct DB query", { id: user.id, role: session.user.role })
        } catch (e) {
          console.error("[auth/session] DB query failed, preserving existing role:", e)
        }
      } else {
        debug("session callback: no user object, defaulting role")
        session.user.role = "CUSTOMER"
      }
      return session
    },
  },
  events: {
    async signIn(message) {
      debug("Auth event: signIn", { userId: message.user.id })
    },
    async createUser(message) {
      debug("Auth event: createUser", { userId: message.user.id, email: message.user.email })
    },
    async linkAccount(message) {
      debug("Auth event: linkAccount", { account: { provider: message.account.provider, type: message.account.type } })
    },
  },
  trustHost: true,
})
