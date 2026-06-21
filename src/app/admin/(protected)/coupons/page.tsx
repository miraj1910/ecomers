import { getAdminCoupons } from "@/actions/coupons"
import { AdminCouponsClient } from "@/components/admin/coupons-table"

export const dynamic = "force-dynamic"

export default async function AdminCouponsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams
  let data: Awaited<ReturnType<typeof getAdminCoupons>> | null = null
  try {
    data = await getAdminCoupons(
      params.page ? Number(params.page) : 1,
      20,
      params.search,
    )
  } catch (error) {
    console.error("Failed to load coupons:", error)
  }

  if (!data) {
    return <div className="p-8 text-secondary">Unable to load coupons.</div>
  }

  return <AdminCouponsClient initialData={data} />
}
