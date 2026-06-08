import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin/sidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log("[admin/layout] checking auth for admin route")
  let session
  try {
    session = await auth()
    console.log("[admin/layout] session:", JSON.stringify({ user: session?.user ? { id: session.user.id, role: session.user.role, email: session.user.email } : null }))
  } catch (error) {
    console.error("[admin/layout] auth() threw:", error)
    redirect("/sign-in")
  }

  if (!session?.user) {
    console.log("[admin/layout] no session user, redirecting to /sign-in")
    redirect("/sign-in")
  }
  if (session.user.role !== "ADMIN") {
    console.log("[admin/layout] user role is", session.user.role, "redirecting to /sign-in")
    redirect("/sign-in")
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
