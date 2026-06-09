"use client"

import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

export default function WishlistError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <Section>
      <Container>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20 mb-4">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold">Failed to load wishlist</h2>
          <p className="mt-2 text-sm text-secondary max-w-md">
            We encountered an error while loading your wishlist. Please try again.
          </p>
          <Button
            onClick={reset}
            variant="outline"
            className="mt-6 gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        </div>
      </Container>
    </Section>
  )
}
