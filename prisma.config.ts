import { defineConfig } from "prisma/config"
import { config } from "dotenv"
// Load .env.local for Prisma CLI (migrate, studio, validate, generate)
config({ path: ".env.local" })

export default defineConfig({
  // DIRECT_URL (port 5432) is used by CLI commands (migrate, studio).
  // DATABASE_URL (pooler, port 6543) is used at runtime via prisma.ts.
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL!,
  },
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
})
