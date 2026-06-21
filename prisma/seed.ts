import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const databaseUrl = process.env.DATABASE_URL!
const adapter = new PrismaPg(databaseUrl)
const prisma = new PrismaClient({ adapter })

const products = [
  { name: "Premium Cotton T-Shirt", slug: "premium-cotton-tshirt", price: 48, sku: "PCT-001", stock: 150, category: "clothing", images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800"] },
  { name: "Oversized Linen Shirt", slug: "oversized-linen-shirt", price: 78, sku: "OLS-001", stock: 75, category: "clothing", images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800"] },
  { name: "Wool Blend Coat", slug: "wool-blend-coat", price: 245, sku: "WBC-001", stock: 30, category: "clothing", images: ["https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=800"] },
  { name: "Minimalist Leather Bag", slug: "minimalist-leather-bag", price: 189, sku: "MLB-001", stock: 25, category: "accessories", images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800"] },
  { name: "Ceramic Mug Set", slug: "ceramic-mug-set", price: 38, sku: "CMS-001", stock: 200, category: "home", images: ["https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800"] },
]

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

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: { name: p.name, price: p.price, sku: p.sku, stock: p.stock, category: p.category, images: p.images },
      create: p,
    })

    await prisma.productInventory.upsert({
      where: { productId: product.id },
      update: { stock: p.stock, sku: p.sku },
      create: { productId: product.id, stock: p.stock, sku: p.sku },
    })

    console.log(`  Seeded product: ${p.name} (${product.id})`)
  }

  console.log(`Seeded ${products.length} products with inventory`)
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
