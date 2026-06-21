declare module "@sentry/nextjs" {
  export function init(options: Record<string, unknown>): void
  export function captureException(error: unknown, options?: { extra?: Record<string, unknown> }): void
  export function captureMessage(message: string, level?: string): void
  export function setUser(user: { id?: string; email?: string } | null): void
  export function startTransaction(options: { name: string; op: string }): { finish: () => void } | null
}
