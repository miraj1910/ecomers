import { NextResponse } from "next/server"
import { z } from "zod"

export function validateBody<T>(
  body: unknown,
  schema: z.ZodType<T>
): { data: T; error: null } | { data: null; error: NextResponse } {
  const result = schema.safeParse(body)
  if (!result.success) {
    const errors = result.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`
    )
    return {
      data: null,
      error: NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 }),
    }
  }
  return { data: result.data, error: null }
}

export function validateSearchParams<T extends z.ZodRawShape>(
  url: URL,
  schema: z.ZodObject<T>
): { data: z.infer<z.ZodObject<T>>; error: null } | { data: null; error: NextResponse } {
  const params: Record<string, string | undefined> = {}
  for (const key of Object.keys(schema.shape)) {
    params[key] = url.searchParams.get(key) ?? undefined
  }
  const result = schema.safeParse(params)
  if (!result.success) {
    return {
      data: null,
      error: NextResponse.json(
        { error: "Invalid query parameters", details: result.error.issues },
        { status: 400 }
      ),
    }
  }
  return { data: result.data, error: null }
}
