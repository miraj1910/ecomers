import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { auth } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin/sidebar"

const ADMIN_COOKIE_NAME = "admin_token"
const ADMIN_COOKIE_VALUE = "verified"

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const adminCookie = cookieStore.get(ADMIN_COOKIE_NAME)

  if (adminCookie?.value === ADMIN_COOKIE_VALUE) {
    console.log("[admin/layout] admin access granted by password cookie")
    return (
      <div className="flex min-h-screen text-white">
        <AdminSidebar />
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    )
  }

  console.log("[admin/layout] checking auth for admin route")
  let session
  try {
    session = await auth()
    console.log("[admin/layout] session:", JSON.stringify({ user: session?.user ? { id: session.user.id, role: session.user.role, email: session.user.email } : null }))
  } catch (error) {
    console.error("[admin/layout] auth() threw:", error)
    redirect("/admin/login")
  }

  if (!session?.user) {
    console.log("[admin/layout] no session user, redirecting to /admin/login")
    redirect("/admin/login")
  }
  if (session.user.role !== "ADMIN") {
    console.log("[admin/layout] user role is", session.user.role, "redirecting to /admin/login")
    redirect("/admin/login")
  }

  console.log("[admin/layout] admin access granted for", session.user.email)
  return (
    <div className="flex min-h-screen text-white">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}
