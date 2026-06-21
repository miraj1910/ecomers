import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "BULK_CREATE" | "BULK_UPDATE" | "BULK_DELETE" | "LOGIN" | "LOGOUT" | "EXPORT" | "IMPORT" | "REFUND" | "CANCEL" | "STATUS_CHANGE"

type AuditEntity = "PRODUCT" | "ORDER" | "USER" | "CATEGORY" | "COUPON" | "INVENTORY" | "REVIEW" | "SETTINGS" | "UPLOAD" | "SESSION"

export async function logAuditEvent(params: {
  actorId?: string | null
  action: AuditAction
  entity: AuditEntity
  entityId?: string | null
  previous?: unknown
  new?: unknown
  ip?: string | null
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        previous: params.previous ? JSON.parse(JSON.stringify(params.previous)) : undefined,
        new: params.new ? JSON.parse(JSON.stringify(params.new)) : undefined,
        ip: params.ip,
      },
    })
  } catch (error) {
    console.error("Failed to write audit log:", error)
  }
}

export async function auditAction<T>(
  action: AuditAction,
  entity: AuditEntity,
  fn: () => Promise<T>,
  options?: {
    entityId?: string
    previous?: unknown
    ip?: string
  }
): Promise<T> {
  const session = await auth().catch(() => null)
  const actorId = session?.user?.id

  let result: T | undefined
  let error: unknown

  try {
    result = await fn()
    return result
  } catch (err) {
    error = err
    throw err
  } finally {
    await logAuditEvent({
      actorId,
      action,
      entity,
      entityId: options?.entityId,
      previous: options?.previous,
      new: error ? undefined : result,
      ip: options?.ip,
    })
  }
}

export function formatAuditPrevious<T extends Record<string, unknown>>(obj: T, keys: (keyof T)[]): Partial<T> {
  const result: Partial<T> = {}
  for (const key of keys) {
    result[key] = obj[key]
  }
  return result
}
