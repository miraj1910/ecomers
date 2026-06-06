import { z } from "zod"

const serverSchema = z.object({
  DATABASE_URL: z.string().url().min(1, "DATABASE_URL is required"),
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters"),
  NEXTAUTH_URL: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
  STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is required"),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
})

const clientSchema = z.object({
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1, "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_SANITY_DATASET: z.string().optional(),
  NEXT_PUBLIC_SANITY_API_VERSION: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
})

type ParsedServer = z.infer<typeof serverSchema>
type ParsedClient = z.infer<typeof clientSchema>

function parseEnv() {
  const parsedServer = serverSchema.safeParse(process.env)
  if (!parsedServer.success) {
    console.error("\n❌ Invalid server environment variables:")
    for (const issue of parsedServer.error.issues) {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`)
    }
    console.error("\nServer will not start until these are fixed.\n")
    throw new Error("Invalid server environment variables")
  }

  const parsedClient = clientSchema.safeParse(process.env)
  if (!parsedClient.success) {
    console.error("\n❌ Invalid client environment variables:")
    for (const issue of parsedClient.error.issues) {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`)
    }
    console.error("\n")
    throw new Error("Invalid client environment variables")
  }

  return { ...parsedServer.data, ...parsedClient.data }
}

const env = parseEnv()

export { env }

export type { ParsedServer, ParsedClient }
