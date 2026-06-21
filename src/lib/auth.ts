import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { ResilientAdapter } from "@/lib/resilient-adapter"

function debug(...args: unknown[]) {
  if (process.env.NODE_ENV === "development" || process.env.AUTH_DEBUG) {
    console.log("[auth]", ...args)
  }
}

function dumpErrorChain(err: unknown, depth = 0): string {
  if (!err || depth > 5) return ""
  const indent = "  ".repeat(depth)
  const prefix = depth === 0 ? "[auth/error]" : "[auth/error/cause]"
  let msg = `${prefix}${indent ? " " + indent : ""}`
  if (err instanceof Error) {
    msg += `${err.name}: ${err.message}\n${err.stack ? err.stack.split("\n").slice(1).join("\n") : ""}`
    if (err.cause) {
      msg += "\n" + dumpErrorChain(err.cause, depth + 1)
    }
  } else {
    msg += String(err)
  }
  return msg
}

// Log that env vars are loaded (NOT the values)
if (process.env.NODE_ENV === "development" || process.env.AUTH_DEBUG) {
  console.log("[auth/env]", {
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
}

let adapter
try {
  adapter = ResilientAdapter(PrismaAdapter(prisma))
} catch (e) {
  console.error("[auth] Failed to create adapter:", dumpErrorChain(e))
  throw e
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  adapter,
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
      console.error(dumpErrorChain(error))
      // Also log raw error for structured logging
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
