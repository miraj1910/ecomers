import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { ProductForm } from "@/components/admin/product-form"

export const dynamic = "force-dynamic"

export default async function NewProductPage() {
  const session = await auth()
  if (!session?.user) redirect("/sign-in")
  if (session.user.role !== "ADMIN") redirect("/sign-in")

  return <ProductForm />
}
