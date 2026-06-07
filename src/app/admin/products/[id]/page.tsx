import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { getAdminProduct } from "@/lib/actions/admin"
import { ProductForm } from "@/components/admin/product-form"

export const dynamic = "force-dynamic"

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/")

  const { id } = await params

  try {
    const product = await getAdminProduct(id)
    return <ProductForm initialData={product} productId={id} />
  } catch (error) {
    console.error("Failed to load product:", error)
    notFound()
  }
}
