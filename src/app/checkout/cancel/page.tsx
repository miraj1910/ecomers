import type { Metadata } from "next"
import Link from "next/link"
import { XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { siteConfig } from "@/lib/seo/metadata"

export const metadata: Metadata = {
  title: "Payment Cancelled",
  description: "Your payment was cancelled.",
  robots: { index: false, follow: false },
  alternates: { canonical: `${siteConfig.url}/checkout/cancel` },
}

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="mb-6 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
          <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
      </div>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">
        Payment cancelled
      </h1>
      <p className="mb-8 text-secondary">
        Your payment was cancelled. No charges have been made.
      </p>
      <Link href="/products">
        <Button className="w-full" size="lg">
          Try again
        </Button>
      </Link>
    </div>
  )
}
