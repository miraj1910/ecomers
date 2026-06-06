import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const databaseUrl = process.env.DATABASE_URL!
const adapter = new PrismaPg(databaseUrl)
const prisma = new PrismaClient({ adapter })

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@ecommers.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@ecommers.com",
      role: "ADMIN",
    },
  })

  console.log("Seeded admin user:", admin.id)

  const inventories = [
    { productId: "premium-cotton-tshirt", stock: 100, sku: "PCT-001" },
    { productId: "oversized-linen-shirt", stock: 50, sku: "OLS-001" },
    { productId: "wool-blend-coat", stock: 30, sku: "WBC-001" },
    { productId: "minimalist-leather-bag", stock: 25, sku: "MLB-001" },
    { productId: "ceramic-mug-set", stock: 200, sku: "CMS-001" },
  ]

  for (const inv of inventories) {
    await prisma.productInventory.upsert({
      where: { productId: inv.productId },
      update: inv,
      create: inv,
    })
  }

  console.log(`Seeded ${inventories.length} inventory items`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
