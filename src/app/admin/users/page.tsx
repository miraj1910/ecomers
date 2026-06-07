import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getAdminUsers } from "@/lib/actions/admin"
import { AdminUsersClient } from "@/components/admin/users-client"

export const dynamic = "force-dynamic"

export default async function AdminUsers({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/")

  const params = await searchParams
  let data: Awaited<ReturnType<typeof getAdminUsers>> | null = null
  try {
    data = await getAdminUsers({
      page: params.page ? Number(params.page) : 1,
      search: params.search,
    })
  } catch (error) {
    console.error("Failed to load admin users:", error)
  }

  if (!data) {
    return <div className="p-8 text-secondary">Unable to load users.</div>
  }

  return <AdminUsersClient initialData={data} />
}
