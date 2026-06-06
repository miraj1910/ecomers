import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error("DATABASE_URL is not set")

const adapter = new PrismaPg(databaseUrl)
const prisma = new PrismaClient({ adapter })

const categoryImages: Record<string, string[]> = {
  Clothing: [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
    "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=600&q=80",
    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&q=80",
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",
    "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&q=80",
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
    "https://images.unsplash.com/photo-1608236415051-3b0da5f033b0?w=600&q=80",
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80",
    "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&q=80",
  ],
  Accessories: [
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80",
    "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&q=80",
    "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=80",
    "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80",
    "https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?w=600&q=80",
    "https://images.unsplash.com/photo-1606503825008-909a67e63c3d?w=600&q=80",
  ],
  Electronics: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
    "https://images.unsplash.com/photo-1546868871-af0de0ae72f5?w=600&q=80",
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80",
    "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&q=80",
  ],
  Footwear: [
    "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&q=80",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80",
    "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600&q=80",
  ],
  Home: [
    "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80",
    "https://images.unsplash.com/photo-1544457070-4cd773b4d71e?w=600&q=80",
    "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80",
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
    "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80",
  ],
}

const productSpecificImages: Record<string, string[]> = {
  "stainless-steel-water-bottle": [
    "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80",
  ],
  "ceramic-mug-set": [
    "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80",
  ],
  "scented-soy-candle-set": [
    "https://images.unsplash.com/photo-1602523950820-b16ec09b89bd?w=600&q=80",
  ],
  "bamboo-cutting-board-set": [
    "https://images.unsplash.com/photo-1594226801341-41427b4e0c0f?w=600&q=80",
  ],
  "french-press-coffee-maker": [
    "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80",
  ],
  "indoor-plant-pot-set": [
    "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&q=80",
  ],
  "cast-iron-skillet": [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
  ],
  "premium-cotton-tshirt": [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
  ],
  "oversized-linen-shirt": [
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
  ],
  "wool-blend-coat": [
    "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=600&q=80",
  ],
  "minimalist-leather-bag": [
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80",
  ],
  "wireless-headphones-pro": [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
  ],
  "slim-fit-chinos": [
    "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80",
  ],
  "handmade-wool-scarf": [
    "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=80",
  ],
  "leather-chelsea-boots": [
    "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&q=80",
  ],
  "cashmere-crew-neck-sweater": [
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",
  ],
  "ultralight-running-shoes": [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
  ],
  "canvas-backpack": [
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",
  ],
  "smart-watch-ultra": [
    "https://images.unsplash.com/photo-1546868871-af0de0ae72f5?w=600&q=80",
  ],
  "denim-jacket": [
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",
  ],
  "aviator-sunglasses": [
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80",
  ],
  "portable-bluetooth-speaker": [
    "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80",
  ],
  "merino-wool-base-layer": [
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
  ],
  "leather-belt": [
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",
  ],
  "mechanical-keyboard": [
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80",
  ],
  "linen-summer-dress": [
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80",
  ],
  "leather-wallet": [
    "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80",
  ],
  "wireless-charging-pad": [
    "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&q=80",
  ],
  "hiking-boots": [
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80",
  ],
  "silk-face-mask-set": [
    "https://images.unsplash.com/photo-1606503825008-909a67e63c3d?w=600&q=80",
  ],
}

let imgIndex: Record<string, number> = {}

function getNextImage(category: string | null): string {
  const cat = category ?? "Home"
  const imgs = categoryImages[cat] ?? categoryImages["Home"]
  if (!imgIndex[cat]) imgIndex[cat] = 0
  const idx = imgIndex[cat] % imgs.length
  imgIndex[cat]++
  return imgs[idx]
}

async function main() {
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
  })

  console.log(`Found ${products.length} products to update\n`)

  let updated = 0
  for (const product of products) {
    const specific = productSpecificImages[product.slug]
    const images = specific ?? [getNextImage(product.category)]

    if (
      product.images.length > 0 &&
      images[0] === product.images[0]
    ) {
      continue
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { images },
    })

    const src = images[0].split("?")[0].split("/").pop() ?? images[0].slice(0, 40)
    console.log(`  ${product.name.padEnd(35)} → ${src}`)
    updated++
  }

  console.log(`\nDone. Updated ${updated} products with images.`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
