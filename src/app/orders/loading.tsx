import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"

export default function OrdersLoading() {
  return (
    <Section>
      <Container>
        <div className="h-8 w-48 rounded-lg bg-muted animate-pulse mb-8" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border p-5"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-36 rounded bg-muted animate-pulse" />
                </div>
                <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="h-3 w-12 rounded bg-muted animate-pulse" />
                  <div className="h-5 w-16 rounded bg-muted animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
