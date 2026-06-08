import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin/sidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let session
  try {
    session = await auth()
  } catch (error) {
    console.error("[admin/layout] auth() threw:", error)
    redirect("/sign-in")
  }

  if (!session?.user) redirect("/sign-in")
  if (session.user.role !== "ADMIN") redirect("/")

  return (
    <div className="flex min-h-screen text-white">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}
