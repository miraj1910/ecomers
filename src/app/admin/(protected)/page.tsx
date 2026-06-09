import { DollarSign, ShoppingBag, Users, Package, AlertTriangle } from "lucide-react"
import { getDashboardStats } from "@/actions/admin"
import { RevenueChart } from "@/components/admin/dashboard/revenue-chart"
import { TopProductsChart } from "@/components/admin/dashboard/top-products-chart"
import { RecentOrdersTable } from "@/components/admin/dashboard/recent-orders-table"
import { LowStockAlerts } from "@/components/admin/dashboard/low-stock-alerts"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
  let stats: Awaited<ReturnType<typeof getDashboardStats>> | null = null
  try {
    stats = await getDashboardStats()
  } catch (error) {
    console.error("Failed to load dashboard stats:", error)
  }

  if (!stats) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-secondary">
            Unable to load dashboard data. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      label: "Total Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      trend: "+12.5%",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingBag,
    },
    {
      label: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
    },
    {
      label: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
    },
    {
      label: "Low Stock Items",
      value: stats.lowStockCount.toString(),
      icon: AlertTriangle,
      alert: stats.lowStockCount > 0,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-secondary">
          Overview of your store
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((card) => (
          <Card key={card.label} as="div">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <p className="text-sm font-medium text-secondary">
                {card.label}
              </p>
              <card.icon
                className={`h-4 w-4 ${
                  card.alert ? "text-red-300" : "text-accent"
                }`}
              />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">{card.value}</p>
              {card.trend && (
                <p className="mt-1 text-xs text-emerald-500">{card.trend}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <RevenueChart data={stats.revenueChart} />
        </div>
        <div className="lg:col-span-3">
          <TopProductsChart data={stats.topProducts} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <RecentOrdersTable orders={stats.recentOrders} />
        </div>
        <div className="lg:col-span-3">
          <LowStockAlerts />
        </div>
      </div>
    </div>
  )
}
