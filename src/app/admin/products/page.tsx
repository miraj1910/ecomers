import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getAdminProducts } from "@/lib/actions/admin"
import { AdminProductsTable } from "@/components/admin/products-table"

export default async function AdminProducts({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/")

  const params = await searchParams
  const data = await getAdminProducts({
    page: params.page ? Number(params.page) : 1,
    search: params.search,
    category: params.category,
    status: params.status,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  })

  return <AdminProductsTable initialData={data} />
}
