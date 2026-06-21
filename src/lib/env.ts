import { z } from "zod"

const serverSchema = z.object({
  DATABASE_URL: z.string().url().min(1, "DATABASE_URL is required"),
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters").optional(),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters").optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  AUTH_URL: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
  STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is required"),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  ADMIN_PASSWORD_HASH: z.string().min(1, "ADMIN_PASSWORD_HASH is required"),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  CRON_SECRET: z.string().optional(),
  CART_RECOVERY_DELAY_HOURS: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),
}).refine(
  (data) => data.AUTH_SECRET || data.NEXTAUTH_SECRET,
  { message: "Either AUTH_SECRET or NEXTAUTH_SECRET is required" }
)

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
