"use client"

import { AlertTriangle, Package, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useEffect, useState } from "react"
import Link from "next/link"

type LowStockItem = {
  productId: string
  stock: number
  sku: string
  threshold: number
}

export function LowStockAlerts() {
  const [items, setItems] = useState<LowStockItem[]>([])
  const [outOfStockCount, setOutOfStockCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/low-stock")
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items ?? [])
        setOutOfStockCount(data.outOfStockCount ?? 0)
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const totalAlerts = items.length + outOfStockCount

  return (
    <Card as="div">
      <CardHeader>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-secondary">
            Inventory Alerts
          </p>
          {totalAlerts > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-error/10 text-error">
              {totalAlerts}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="px-6 py-8 text-center text-sm text-secondary">
            Loading...
          </div>
        ) : totalAlerts === 0 ? (
          <div className="flex flex-col items-center px-6 py-8 text-center">
            <Package className="mb-2 h-8 w-8 text-secondary/50" />
            <p className="text-sm text-secondary">
              All products are well stocked
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {outOfStockCount > 0 && (
              <div className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-error" />
                  <span className="text-sm font-medium text-foreground">Out of stock</span>
                </div>
                <span className="text-sm font-medium text-error">
                  {outOfStockCount}
                </span>
              </div>
            )}
            {items.slice(0, 5).map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between px-6 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{item.productId}</p>
                  <p className="mt-0.5 text-xs text-secondary">
                    SKU: {item.sku} &middot; Threshold: {item.threshold}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium text-accent">
                    {item.stock}
                  </span>
                </div>
              </div>
            ))}
            {items.length > 5 && (
              <Link
                href="/admin/inventory"
                className="flex items-center justify-center px-6 py-3 text-sm text-secondary hover:text-foreground hover:bg-foreground/5 transition-colors"
              >
                View all {items.length} low stock items
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
