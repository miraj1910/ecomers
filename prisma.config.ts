import { defineConfig } from "prisma/config"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

// Use DIRECT_URL for migrations (direct connection to Supabase),
// fall back to DATABASE_URL (pooler) if DIRECT_URL is not set.
const databaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "postgresql://dummy:dummy@localhost:5432/dummy?schema=public"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
})
