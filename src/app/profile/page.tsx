import type { Prisma } from "@prisma/client"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"
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
        <div className="mb-12">
          <span className="meta">Account</span>
          <h1 className="heading-section mt-2 text-text-primary">Profile</h1>
        </div>

        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="font-serif text-xl font-normal text-text-primary mb-5">Account Information</h2>
              <div className="space-y-4">
                <div className="flex border-b border-border-subtle pb-4">
                  <span className="text-xs text-text-secondary w-24 uppercase tracking-wider">Name</span>
                  <span className="text-sm text-text-primary">{name}</span>
                </div>
                <div className="flex border-b border-border-subtle pb-4">
                  <span className="text-xs text-text-secondary w-24 uppercase tracking-wider">Email</span>
                  <span className="text-sm text-text-primary">{email}</span>
                </div>
                <div className="flex border-b border-border-subtle pb-4">
                  <span className="text-xs text-text-secondary w-24 uppercase tracking-wider">Role</span>
                  <span className="text-sm text-text-primary capitalize">{role.toLowerCase()}</span>
                </div>
                {joined && (
                  <div className="flex border-b border-border-subtle pb-4">
                    <span className="text-xs text-text-secondary w-24 uppercase tracking-wider">Member</span>
                    <span className="text-sm text-text-primary">
                      {joined.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="font-serif text-xl font-normal text-text-primary mb-5">Account Security</h2>
              <p className="text-sm text-text-secondary">
                You are signed in with Google. Your account is secured by Google&apos;s authentication.
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-serif text-xl font-normal text-text-primary mb-5">Quick Links</h2>
            <nav className="flex flex-col gap-2">
              {[
                { href: "/wishlist", label: "Wishlist" },
                { href: "/orders", label: "Order History" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
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
