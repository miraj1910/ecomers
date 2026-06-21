"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/middleware-helpers"
import { CACHE_TAGS } from "@/lib/cache"
import { createCategorySchema, updateCategorySchema } from "@/lib/validations/category"
import type { CreateCategoryInput, UpdateCategoryInput } from "@/lib/validations/category"

export async function getAdminCategories() {
  await requireAdmin()

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  })

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? "",
    image: c.image ?? "",
    productCount: c._count.products,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }))
}

export async function getAdminCategory(id: string) {
  await requireAdmin()

  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) throw new Error("Category not found")

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    image: category.image ?? "",
  }
}

export async function createCategory(input: CreateCategoryInput) {
  await requireAdmin()

  const parsed = createCategorySchema.parse(input)

  const existing = await prisma.category.findUnique({ where: { slug: parsed.slug } })
  if (existing) throw new Error("A category with this slug already exists")

  const category = await prisma.category.create({
    data: {
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description || null,
      image: parsed.image || null,
    },
  })

  revalidatePath("/admin/categories")
  revalidateTag(CACHE_TAGS.categories, 'max')
  revalidateTag(CACHE_TAGS.products, 'max')

  return { id: category.id }
}

export async function updateCategory(input: UpdateCategoryInput) {
  await requireAdmin()

  const parsed = updateCategorySchema.parse(input)

  const existing = await prisma.category.findUnique({ where: { id: parsed.id } })
  if (!existing) throw new Error("Category not found")

  if (parsed.slug && parsed.slug !== existing.slug) {
    const slugExists = await prisma.category.findUnique({ where: { slug: parsed.slug } })
    if (slugExists) throw new Error("A category with this slug already exists")
  }

  const data: Record<string, unknown> = {}
  if (parsed.name !== undefined) data.name = parsed.name
  if (parsed.slug !== undefined) data.slug = parsed.slug
  if (parsed.description !== undefined) data.description = parsed.description || null
  if (parsed.image !== undefined) data.image = parsed.image || null

  await prisma.category.update({ where: { id: parsed.id }, data })

  revalidatePath("/admin/categories")
  revalidateTag(CACHE_TAGS.categories, 'max')
  revalidateTag(CACHE_TAGS.products, 'max')
}

export async function deleteCategory(id: string) {
  await requireAdmin()

  const existing = await prisma.category.findUnique({ where: { id } })
  if (!existing) throw new Error("Category not found")

  await prisma.product.updateMany({
    where: { categoryId: id },
    data: { categoryId: null, category: null },
  })

  await prisma.category.delete({ where: { id } })

  revalidatePath("/admin/categories")
  revalidateTag(CACHE_TAGS.categories, 'max')
  revalidateTag(CACHE_TAGS.products, 'max')
  revalidateTag(CACHE_TAGS.featured, 'max')
}
