import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getInventoryPage } from "@/actions/inventory"
import { InventoryClient } from "@/components/admin/inventory/inventory-client"

export const dynamic = "force-dynamic"

export default async function AdminInventory({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/")

  const params = await searchParams
  const page = params.page ? Number(params.page) : 1
  const search = params.search

  const data = await getInventoryPage(page, 20, search)

  return <InventoryClient initialData={data} />
}
