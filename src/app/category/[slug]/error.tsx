"use client"

import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function CategoryError({
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
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <AlertTriangle className="h-6 w-6 text-secondary" />
          </div>
          <h2 className="text-lg font-medium">Something went wrong</h2>
          <p className="mt-1 text-sm text-secondary max-w-sm">
            We couldn&apos;t load this category. Please try again.
          </p>
          <Button variant="outline" className="mt-6" onClick={reset}>
            Try Again
          </Button>
        </div>
      </Container>
    </Section>
  )
}
