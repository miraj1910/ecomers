import { NextResponse } from "next/server"

interface RateLimitConfig {
  interval: number
  maxRequests: number
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

const CLEANUP_INTERVAL = 60_000
let lastCleanup = Date.now()

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}

const DEFAULT_CONFIG: RateLimitConfig = {
  interval: 60 * 1000,
  maxRequests: 30,
}

export function rateLimit(
  key: string,
  config: Partial<RateLimitConfig> = {}
): { success: boolean; remaining: number; resetIn: number } {
  cleanup()
  const { interval, maxRequests } = { ...DEFAULT_CONFIG, ...config }
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + interval })
    return { success: true, remaining: maxRequests - 1, resetIn: interval }
  }

  entry.count++

  if (entry.count > maxRequests) {
    return { success: false, remaining: 0, resetIn: entry.resetAt - now }
  }

  return { success: true, remaining: maxRequests - entry.count, resetIn: entry.resetAt - now }
}

export function rateLimitMiddleware(
  key: string,
  config?: Partial<RateLimitConfig>
): NextResponse | null {
  const result = rateLimit(key, config)
  if (!result.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(result.resetIn / 1000).toString(),
          "X-RateLimit-Limit": (config?.maxRequests ?? DEFAULT_CONFIG.maxRequests).toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": Math.ceil((Date.now() + result.resetIn) / 1000).toString(),
        },
      }
    )
  }
  return null
}

export function getRateLimitKey(request: Request): string {
  return request.headers.get("x-forwarded-for")
    ?? request.headers.get("x-real-ip")
    ?? "unknown"
}
