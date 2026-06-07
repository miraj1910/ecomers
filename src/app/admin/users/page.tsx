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
  const data = await getAdminUsers({
    page: params.page ? Number(params.page) : 1,
    search: params.search,
  })

  return <AdminUsersClient initialData={data} />
}
