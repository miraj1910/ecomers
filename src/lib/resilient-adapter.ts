import type { Adapter, AdapterUser, AdapterAccount } from "@auth/core/adapters"

let dbReachable = true

function isDbError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false
  const msg = String(err)
  return msg.includes("Can't reach database") || msg.includes("DatabaseNotReachable") || msg.includes("connect ECONNREFUSED")
}

export function ResilientAdapter(base: Adapter): Adapter {
  const wrapped: Record<string, unknown> = {}

  for (const [key, fn] of Object.entries(base)) {
    if (typeof fn !== "function") {
      wrapped[key] = fn
      continue
    }
    wrapped[key] = async (...args: unknown[]) => {
      if (!dbReachable) {
        if (key === "createUser" && args[0]) {
          return { ...(args[0] as AdapterUser), id: crypto.randomUUID() }
        }
        if (key === "linkAccount" && args[0]) {
          return { ...(args[0] as AdapterAccount) }
        }
        return null
      }

      try {
        return await fn(...args)
      } catch (err) {
        if (isDbError(err)) {
          dbReachable = false
          if (key === "createUser" && args[0]) {
            return { ...(args[0] as AdapterUser), id: crypto.randomUUID() }
          }
          if (key === "linkAccount" && args[0]) {
            return { ...(args[0] as AdapterAccount) }
          }
          return null
        }
        throw err
      }
    }
  }

  return wrapped as Adapter
}
