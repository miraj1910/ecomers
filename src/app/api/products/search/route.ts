import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { rateLimitMiddleware } from "@/lib/security/rate-limit"

export async function GET(request: Request) {
  const rl = rateLimitMiddleware("search", { maxRequests: 60, interval: 60_000 })
  if (rl) return rl

  const url = new URL(request.url)
  const q = url.searchParams.get("q")?.trim()
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1)
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize")) || 20))
  const category = url.searchParams.get("category")

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [], total: 0, page, pageSize, totalPages: 0 })
  }

  const sanitized = q.replace(/[^\w\s-]/g, "").trim()
  if (!sanitized) {
    return NextResponse.json({ results: [], total: 0, page, pageSize, totalPages: 0 })
  }

  try {
    const tsQuery = sanitized.split(/\s+/).filter(Boolean).join(" & ")

    let whereClause = `"deletedAt" IS NULL AND "status" = 'ACTIVE'`
    let categoryJoin = ""
    const params: unknown[] = [tsQuery]

    if (category) {
      whereClause += ` AND LOWER("category") = LOWER($${params.length + 1})`
      params.push(category)
    }

    const countResult = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
      `SELECT COUNT(*) FROM "Product" WHERE ${whereClause} AND to_tsvector('english', "name" || ' ' || COALESCE("description", '')) @@ to_tsquery('english', $1)`,
      ...params
    )
    const total = Number(countResult[0]?.count ?? 0)

    const offset = (page - 1) * pageSize
    const results = await prisma.$queryRawUnsafe<
      Array<{
        id: string
        name: string
        slug: string
        description: string | null
        price: string
        discount_price: string | null
        stock: number
        images: string[]
        category: string | null
        rank: number
      }>
    >(
      `SELECT 
        id, name, slug, description, 
        "discountPrice" as discount_price,
        price, stock, images, category,
        ts_rank(to_tsvector('english', "name" || ' ' || COALESCE("description", '')), to_tsquery('english', $1)) as rank
      FROM "Product" 
      WHERE ${whereClause}
        AND to_tsvector('english', "name" || ' ' || COALESCE("description", '')) @@ to_tsquery('english', $1)
      ORDER BY 
        CASE WHEN LOWER("name") = LOWER($${params.length + 1}) THEN 0 ELSE 1 END,
        rank DESC
      LIMIT $${params.length + 2} OFFSET $${params.length + 3}`,
      ...params,
      sanitized,
      pageSize,
      offset
    )

    const suggestionsQuery = sanitized.split(/\s+/)[0]
    const suggestions = await prisma.$queryRawUnsafe<
      Array<{ name: string }>
    >(
      `SELECT DISTINCT "name" FROM "Product" 
       WHERE ${whereClause}
         AND to_tsvector('english', "name") @@ to_tsquery('english', $1 || ':*')
       ORDER BY "name" ASC
       LIMIT 5`,
      suggestionsQuery
    )

    const mappedResults = results.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      price: Number(r.price),
      comparePrice: r.discount_price ? Number(r.discount_price) : null,
      stock: r.stock,
      image: (r.images as string[])?.[0] ?? null,
      category: r.category,
    }))

    return NextResponse.json({
      results: mappedResults,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      suggestions: suggestions.map((s) => s.name),
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ results: [], total: 0, page, pageSize, totalPages: 0, error: "Search failed" }, { status: 500 })
  }
}
