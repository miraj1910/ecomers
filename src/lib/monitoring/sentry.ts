const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN || ""
const SENTRY_ENABLED = !!SENTRY_DSN

type SeverityLevel = "fatal" | "error" | "warning" | "log" | "info" | "debug"

let SentryModule: typeof import("@sentry/nextjs") | null = null

async function loadSentry() {
  if (!SENTRY_ENABLED || SentryModule) return SentryModule
  try {
    SentryModule = await import("@sentry/nextjs")
    SentryModule.init({
      dsn: SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 0,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: process.env.NODE_ENV === "production" ? 1.0 : 0,
    })
  } catch {
    console.warn("Sentry not available, skipping initialization")
  }
  return SentryModule
}

export async function captureException(error: unknown, context?: Record<string, unknown>) {
  const sentry = await loadSentry()
  if (!sentry) return
  sentry.captureException(error, { extra: context })
}

export async function captureMessage(message: string, level: SeverityLevel = "info") {
  const sentry = await loadSentry()
  if (!sentry) return
  sentry.captureMessage(message, level)
}

export async function setUser(user: { id: string; email?: string } | null) {
  const sentry = await loadSentry()
  if (!sentry) return
  sentry.setUser(user)
}

export function startTransaction(name: string, op: string) {
  if (!SentryModule) return null
  try {
    return SentryModule.startTransaction({ name, op })
  } catch {
    return null
  }
}

export function isSentryEnabled(): boolean {
  return SENTRY_ENABLED
}
