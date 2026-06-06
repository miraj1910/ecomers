import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { ProductForm } from "@/components/admin/product-form"

export default async function NewProductPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/")

  return <ProductForm />
}
