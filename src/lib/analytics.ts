import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

export async function trackEvent(
  event: string,
  data?: Record<string, unknown>,
  userId?: string | null
): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: {
        event,
        data: (data ?? {}) as Prisma.InputJsonValue,
        userId: userId ?? null,
      },
    })
  } catch (error) {
    console.error(`[Analytics] Failed to track event "${event}":`, error)
  }
}

export async function getEventCount(
  event: string,
  since?: Date
): Promise<number> {
  const where: Record<string, unknown> = { event }
  if (since) {
    where.createdAt = { gte: since }
  }
  return prisma.analyticsEvent.count({ where })
}

export async function getEventCountGrouped(
  event: string,
  since?: Date,
  groupBy: "day" | "week" | "month" = "day"
): Promise<{ date: string; count: number }[]> {
  const dateTrunc = groupBy === "day" ? "day" : groupBy === "week" ? "week" : "month"

  const raw = await prisma.$queryRawUnsafe<{ date: Date; count: bigint }[]>(
    `SELECT DATE_TRUNC($1, "createdAt") as date, COUNT(*)::int as count
     FROM "AnalyticsEvent"
     WHERE event = $2 ${since ? "AND \"createdAt\" >= $3" : ""}
     GROUP BY date
     ORDER BY date ASC`,
    dateTrunc,
    event,
    ...(since ? [since] : [])
  )

  return raw.map((r) => ({
    date: r.date instanceof Date ? r.date.toISOString().split("T")[0] : String(r.date),
    count: Number(r.count),
  }))
}
