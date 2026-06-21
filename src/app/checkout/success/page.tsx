import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { siteConfig } from "@/lib/seo/metadata"
import { Container } from "@/components/layout/container"

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
      <Container>
        <div className="mx-auto max-w-md py-24 text-center">
          <div className="mb-8">
            <div className="mx-auto h-16 w-16 flex items-center justify-center bg-success/5">
              <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
          </div>
          <h1 className="heading-product text-text-primary">Payment successful!</h1>
          <p className="mt-4 text-sm text-text-secondary">
            Thank you for your order. You&apos;ll receive a confirmation email shortly.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Link href={session?.user ? "/orders" : "/"}>
              <Button>
                {session?.user ? "View Orders" : "Continue shopping"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </Container>
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
    <Container>
      <div className="mx-auto max-w-md py-24 text-center">
        <div className="mb-8">
          <div className="mx-auto h-16 w-16 flex items-center justify-center bg-success/5">
            <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        </div>
        <h1 className="heading-product text-text-primary">Payment successful!</h1>
        <p className="mt-4 text-sm text-text-secondary">
          Thank you for your order. You&apos;ll receive a confirmation email shortly.
        </p>
        {order && (
          <p className="mt-3 text-sm text-text-secondary">
            Order reference: #{order.id.slice(0, 8)}
          </p>
        )}
        {!order && stripeSessionId && (
          <p className="mt-3 text-sm text-text-secondary">
            Your order is being processed. Check back shortly.
          </p>
        )}
        <div className="mt-10 flex flex-col items-center gap-4">
          {order && (
            <Link href={`/orders/${order.id}`}>
              <Button>
                View Order Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
          <Link href={session?.user ? "/orders" : "/"}>
            <Button variant="secondary">
              {session?.user ? "All Orders" : "Continue shopping"}
            </Button>
          </Link>
        </div>
      </div>
    </Container>
  )
}
