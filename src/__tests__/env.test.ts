import { describe, it, expect } from "vitest"
import { z } from "zod"

const testServerSchema = z.object({
  DATABASE_URL: z.string().url().min(1),
  NEXTAUTH_SECRET: z.string().min(32),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
})

const testClientSchema = z.object({
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
})

describe("Environment Validation Schema", () => {
  it("validates server env vars", () => {
    const result = testServerSchema.safeParse({
      DATABASE_URL: "postgresql://user:pass@localhost:5432/db?schema=public",
      NEXTAUTH_SECRET: "abcdefghijklmnopqrstuvwxyz0123456789abcdef",
      GOOGLE_CLIENT_ID: "client-id-123",
      GOOGLE_CLIENT_SECRET: "client-secret-456",
      STRIPE_SECRET_KEY: "sk_test_123",
    })
    expect(result.success).toBe(true)
  })

  it("rejects invalid DATABASE_URL", () => {
    const result = testServerSchema.safeParse({
      DATABASE_URL: "not-a-url",
      NEXTAUTH_SECRET: "abcdefghijklmnopqrstuvwxyz0123456789abcdef",
      GOOGLE_CLIENT_ID: "client-id-123",
      GOOGLE_CLIENT_SECRET: "client-secret-456",
      STRIPE_SECRET_KEY: "sk_test_123",
    })
    expect(result.success).toBe(false)
  })

  it("rejects short NEXTAUTH_SECRET", () => {
    const result = testServerSchema.safeParse({
      DATABASE_URL: "postgresql://user:pass@localhost:5432/db?schema=public",
      NEXTAUTH_SECRET: "short",
      GOOGLE_CLIENT_ID: "client-id-123",
      GOOGLE_CLIENT_SECRET: "client-secret-456",
      STRIPE_SECRET_KEY: "sk_test_123",
    })
    expect(result.success).toBe(false)
  })

  it("rejects missing required vars", () => {
    const result = testServerSchema.safeParse({
      DATABASE_URL: "postgresql://user:pass@localhost:5432/db?schema=public",
    })
    expect(result.success).toBe(false)
  })

  it("validates client env vars", () => {
    const result = testClientSchema.safeParse({
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_123",
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty publishable key", () => {
    const result = testClientSchema.safeParse({
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "",
    })
    expect(result.success).toBe(false)
  })
})
