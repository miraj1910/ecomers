import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Check your .env.local or .env file."
  )
}

const sanitizedUrl = databaseUrl.replace(
  /\/\/([^:]+):([^@]+)@/,
  "//***:***@"
)
console.log("[prisma] connecting with config", {
  url: sanitizedUrl,
  max: process.env.NODE_ENV === "production" ? 5 : 3,
})

const pool = new Pool({
  connectionString: databaseUrl,
  max: process.env.NODE_ENV === "production" ? 5 : 3,
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 30000,
})

pool.on("error", (err) => {
  console.error("[prisma/pool] unexpected pool error", err)
})

const adapter = new PrismaPg(pool)

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

// Startup health check — log but don't crash
;(async function healthCheck() {
  try {
    const start = Date.now()
    await prisma.$queryRaw`SELECT 1 AS ok`
    console.log("[prisma] health check OK", `${Date.now() - start}ms`)
  } catch (e) {
    console.error("[prisma] health check FAILED — database unreachable:", e)
  }
})()
