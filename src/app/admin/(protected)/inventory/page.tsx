import { getInventoryPage } from "@/actions/inventory"
import { InventoryClient } from "@/components/admin/inventory/inventory-client"

export const dynamic = "force-dynamic"

export default async function AdminInventory({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams
  const page = params.page ? Number(params.page) : 1
  const search = params.search

  let data: Awaited<ReturnType<typeof getInventoryPage>> | null = null
  try {
    data = await getInventoryPage(page, 20, search)
  } catch (error) {
    console.error("Failed to load inventory:", error)
  }

  if (!data) {
    return <div className="p-8 text-secondary">Unable to load inventory.</div>
  }

  return <InventoryClient initialData={data} />
}
