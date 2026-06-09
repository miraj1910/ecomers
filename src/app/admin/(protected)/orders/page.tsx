import { getAdminOrders } from "@/lib/actions/admin"
import { AdminOrdersClient } from "@/components/admin/orders-client"

export const dynamic = "force-dynamic"

export default async function AdminOrders({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams
  let data: Awaited<ReturnType<typeof getAdminOrders>> | null = null
  try {
    data = await getAdminOrders({
      page: params.page ? Number(params.page) : 1,
      search: params.search,
      status: params.status,
    })
  } catch (error) {
    console.error("Failed to load admin orders:", error)
  }

  if (!data) {
    return <div className="p-8 text-secondary">Unable to load orders.</div>
  }

  return <AdminOrdersClient initialData={data} />
}
