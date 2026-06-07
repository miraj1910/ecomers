import { defineConfig } from "prisma/config"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const databaseUrl = process.env.DATABASE_URL ?? "postgresql://dummy:dummy@localhost:5432/dummy?schema=public"

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
