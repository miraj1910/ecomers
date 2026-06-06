import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
