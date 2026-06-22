import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

function debug(...args: unknown[]) {
  if (process.env.NODE_ENV === "development" || process.env.AUTH_DEBUG) {
    console.log("[auth]", ...args)
  }
}

// Log env var presence (NOT values)
debug("[auth/env]", {
  hasGoogleId: !!process.env.GOOGLE_CLIENT_ID,
  hasGoogleSecret: !!process.env.GOOGLE_CLIENT_SECRET,
  hasAuthGoogleId: !!process.env.AUTH_GOOGLE_ID,
  hasAuthGoogleSecret: !!process.env.AUTH_GOOGLE_SECRET,
  hasAuthSecret: !!process.env.AUTH_SECRET,
  hasNexthAuthSecret: !!process.env.NEXTAUTH_SECRET,
  hasDatabaseUrl: !!process.env.DATABASE_URL,
  hasAuthUrl: !!process.env.AUTH_URL,
  hasNextauthUrl: !!process.env.NEXTAUTH_URL,
  nodeEnv: process.env.NODE_ENV,
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  logger: {
    error(error) {
      console.error("[auth/logger/error]", error)
      if (error instanceof Error && error.cause) {
        console.error("[auth/logger/error/cause]", error.cause)
      }
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
    async signIn({ user, account }) {
      debug("[auth/signIn] callback", { email: user.email, provider: account?.provider })
      if (!user.email) {
        console.warn("[auth/signIn] no email, denying")
        return false
      }
      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { status: true, deletedAt: true, role: true },
        })
        if (dbUser?.deletedAt) {
          console.warn("[auth/signIn] deleted user denied", user.email)
          return false
        }
        if (dbUser?.status === "BLOCKED") {
          console.warn("[auth/signIn] blocked user denied", user.email)
          return false
        }
        debug("[auth/signIn] authorized", { email: user.email, role: dbUser?.role })
        return true
      } catch (e) {
        // Transient DB error — log prominently but allow access rather than
        // permanently denying all users during an outage.
        console.error("[auth/signIn] DB query failed, allowing access:", e)
        return true
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
        } catch (e) {
          console.error("[auth/session] DB query failed, defaulting role:", e)
          session.user.role = "CUSTOMER"
        }
      } else {
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
