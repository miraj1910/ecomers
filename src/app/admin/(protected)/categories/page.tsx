import { getAdminCategories } from "@/actions/categories"
import { AdminCategoriesTable } from "@/components/admin/categories-table"

export const dynamic = "force-dynamic"

export default async function AdminCategories() {
  let data: Awaited<ReturnType<typeof getAdminCategories>> | null = null
  try {
    data = await getAdminCategories()
  } catch (error) {
    console.error("Failed to load admin categories:", error)
  }

  if (!data) {
    return <div className="p-8 text-secondary">Unable to load categories.</div>
  }

  return <AdminCategoriesTable initialData={data} />
}
