import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getAdminOrders } from "@/lib/actions/admin"
import { AdminOrdersClient } from "@/components/admin/orders-client"

export default async function AdminOrders({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/")

  const params = await searchParams
  const data = await getAdminOrders({
    page: params.page ? Number(params.page) : 1,
    search: params.search,
    status: params.status,
  })

  return <AdminOrdersClient initialData={data} />
}
