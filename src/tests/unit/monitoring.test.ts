import { describe, it, expect, vi, beforeEach } from "vitest"

describe("Health Check Endpoint", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("returns healthy status when database is reachable", async () => {
    vi.mock("@/lib/prisma", () => ({
      prisma: {
        $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }]),
      },
    }))

    const { GET } = await import("@/app/api/health/route")
    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.status).toBe("healthy")
    expect(body.checks.database).toBe("ok")
  })

  it("returns unhealthy status when database is unreachable", async () => {
    vi.mock("@/lib/prisma", () => ({
      prisma: {
        $queryRaw: vi.fn().mockRejectedValue(new Error("Connection refused")),
      },
    }))

    const { GET } = await import("@/app/api/health/route")
    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(503)
    expect(body.status).toBe("unhealthy")
    expect(body.checks.database).toBe("error")
  })

  it("includes uptime and timestamp in response", async () => {
    vi.mock("@/lib/prisma", () => ({
      prisma: {
        $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }]),
      },
    }))

    const { GET } = await import("@/app/api/health/route")
    const response = await GET()
    const body = await response.json()

    expect(body).toHaveProperty("uptime")
    expect(body).toHaveProperty("timestamp")
    expect(typeof body.uptime).toBe("number")
    expect(typeof body.timestamp).toBe("string")
  })
})

describe("Sentry Integration", () => {
  it("exports captureException function", async () => {
    const sentry = await import("@/lib/monitoring/sentry")
    expect(typeof sentry.captureException).toBe("function")
  })

  it("exports captureMessage function", async () => {
    const sentry = await import("@/lib/monitoring/sentry")
    expect(typeof sentry.captureMessage).toBe("function")
  })

  it("exports setUser function", async () => {
    const sentry = await import("@/lib/monitoring/sentry")
    expect(typeof sentry.setUser).toBe("function")
  })

  it("isSentryEnabled returns false when no DSN", async () => {
    const prev = process.env.SENTRY_DSN
    delete process.env.SENTRY_DSN
    delete process.env.NEXT_PUBLIC_SENTRY_DSN

    const { isSentryEnabled } = await import("@/lib/monitoring/sentry")
    expect(isSentryEnabled()).toBe(false)

    process.env.SENTRY_DSN = prev
  })
})
