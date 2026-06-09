import { getAdminProducts } from "@/lib/actions/admin"
import { AdminProductsTable } from "@/components/admin/products-table"

export const dynamic = "force-dynamic"

export default async function AdminProducts({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams
  let data: Awaited<ReturnType<typeof getAdminProducts>> | null = null
  try {
    data = await getAdminProducts({
      page: params.page ? Number(params.page) : 1,
      search: params.search,
      category: params.category,
      status: params.status,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    })
  } catch (error) {
    console.error("Failed to load admin products:", error)
  }

  if (!data) {
    return <div className="p-8 text-secondary">Unable to load products.</div>
  }

  return <AdminProductsTable initialData={data} />
}
