import { notFound } from "next/navigation"
import { getAdminProduct } from "@/lib/actions/admin"
import { ProductForm } from "@/components/admin/product-form"

export const dynamic = "force-dynamic"

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let product: Awaited<ReturnType<typeof getAdminProduct>> | undefined
  try {
    product = await getAdminProduct(id)
  } catch (error) {
    console.error("Failed to load product:", error)
    notFound()
  }
  if (!product) notFound()
  return <ProductForm initialData={product} productId={id} />
}
