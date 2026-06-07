import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { siteConfig } from "@/lib/seo/metadata"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Order Confirmation",
  description: "Your order has been confirmed.",
  robots: { index: false, follow: false },
  alternates: { canonical: `${siteConfig.url}/checkout/success` },
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const session = await auth()

  const params = await searchParams
  const stripeSessionId = params.session_id

  if (!stripeSessionId) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">
          Payment successful!
        </h1>
        <p className="mb-8 text-secondary">
          Thank you for your order. You&apos;ll receive a confirmation email
          shortly.
        </p>
        <div className="flex flex-col gap-3">
          <Link href={session?.user ? "/orders" : "/"}>
            <Button className="w-full" size="lg">
              {session?.user ? "View Orders" : "Continue shopping"}
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  let order: Awaited<ReturnType<typeof prisma.order.findUnique>> = null
  try {
    order = await prisma.order.findUnique({
      where: { stripeSessionId },
    })
  } catch (error) {
    console.error("Failed to look up order:", error)
  }

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="mb-6 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
      </div>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">
        Payment successful!
      </h1>
      <p className="mb-2 text-secondary">
        Thank you for your order. You&apos;ll receive a confirmation email
        shortly.
      </p>
      {order && (
        <p className="mb-8 text-sm text-secondary">
          Order reference: #{order.id.slice(0, 8)}
        </p>
      )}
      {!order && stripeSessionId && (
        <p className="mb-8 text-sm text-secondary">
          Your order is being processed. Check back shortly.
        </p>
      )}
      <div className="flex flex-col gap-3">
        {order && (
          <Link href={`/orders/${order.id}`}>
            <Button className="w-full" size="lg">
              View Order Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
        <Link href={session?.user ? "/orders" : "/"}>
          <Button variant="outline" className="w-full" size="lg">
            {session?.user ? "All Orders" : "Continue shopping"}
          </Button>
        </Link>
      </div>
    </div>
  )
}
