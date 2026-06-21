"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

type TopProduct = {
  name: string
  totalSold: number
}

export function TopProductsChart({ data }: { data: TopProduct[] }) {
  const top5 = data.slice(0, 5).map((p) => ({
    name: p.name.length > 20 ? p.name.slice(0, 20) + "..." : p.name,
    sold: p.totalSold,
  }))

  return (
    <Card as="div">
      <CardHeader>
        <p className="text-sm font-medium text-secondary">
          Top Products
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top5} layout="vertical">
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "var(--color-muted)" }}
                tickLine={false}
                axisLine={false}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  fontSize: "13px",
                  color: "var(--color-foreground)",
                }}
                formatter={(value) => [Number(value), "Units sold"]}
              />
              <Bar
                dataKey="sold"
                fill="var(--color-accent)"
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
