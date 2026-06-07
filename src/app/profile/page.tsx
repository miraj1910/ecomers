import type { Prisma } from "@prisma/client"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"
import { User, Mail, Shield, Calendar, BadgeCheck } from "lucide-react"
import Link from "next/link"

type UserProfile = Prisma.UserGetPayload<{ select: { role: true; createdAt: true } }>

export const dynamic = "force-dynamic"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) redirect("/sign-in")

  let dbUser: UserProfile | null = null
  try {
    dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, createdAt: true },
    })
  } catch (error) {
    console.error("Failed to load user data:", error)
  }

  const user = session.user
  const email = user.email ?? ""
  const name = user.name ?? "User"
  const role = dbUser?.role ?? "CUSTOMER"
  const joined = dbUser?.createdAt

  return (
    <Section>
      <Container>
        <h1 className="text-4xl font-bold tracking-tight text-white mb-8">Profile</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-border bg-surface rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <User className="h-4 w-4 text-accent" />
                Account Information
              </h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-xs text-secondary mb-1">Name</dt>
                  <dd className="text-sm font-medium text-white">{name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-secondary mb-1 flex items-center gap-1.5">
                    <Mail className="h-3 w-3" />
                    Email
                  </dt>
                  <dd className="text-sm font-medium text-white">{email}</dd>
                </div>
                <div>
                  <dt className="text-xs text-secondary mb-1 flex items-center gap-1.5">
                    <BadgeCheck className="h-3 w-3" />
                    Role
                  </dt>
                  <dd className="text-sm font-medium capitalize text-white">{role.toLowerCase()}</dd>
                </div>
                {joined && (
                  <div>
                    <dt className="text-xs text-secondary mb-1 flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      Member since
                    </dt>
                    <dd className="text-sm font-medium text-white">
                      {joined.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="rounded-2xl border border-border bg-surface rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4 text-accent" />
                Account Security
              </h2>
              <p className="text-sm text-secondary">
                You are signed in with Google. Your account is secured by
                Google&apos;s authentication.
              </p>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 h-fit">
            <h2 className="text-sm font-semibold text-white mb-3">Quick Links</h2>
            <nav className="flex flex-col gap-1">
              {[
                { href: "/wishlist", label: "Wishlist" },
                { href: "/orders", label: "Order History" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-xl px-3 py-2 text-sm text-secondary transition-colors hover:bg-white/[0.07] hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </Container>
    </Section>
  )
}
