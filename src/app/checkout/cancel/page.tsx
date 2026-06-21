import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { siteConfig } from "@/lib/seo/metadata"
import { Container } from "@/components/layout/container"

export const metadata: Metadata = {
  title: "Payment Cancelled",
  description: "Your payment was cancelled.",
  robots: { index: false, follow: false },
  alternates: { canonical: `${siteConfig.url}/checkout/cancel` },
}

export default function CheckoutCancelPage() {
  return (
    <Container>
      <div className="mx-auto max-w-md py-24 text-center">
        <div className="mb-8">
          <div className="mx-auto h-16 w-16 flex items-center justify-center bg-error/5">
            <svg className="h-8 w-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
        <h1 className="heading-product text-text-primary">Payment cancelled</h1>
        <p className="mt-4 text-sm text-text-secondary">
          Your payment was cancelled. No charges have been made.
        </p>
        <div className="mt-10">
          <Link href="/products">
            <Button>Try again</Button>
          </Link>
        </div>
      </div>
    </Container>
  )
}
