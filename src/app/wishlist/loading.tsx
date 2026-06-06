import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"

export default function WishlistLoading() {
  return (
    <Section>
      <Container>
        <div className="h-8 w-32 rounded-lg bg-muted animate-pulse mb-8" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border overflow-hidden">
              <div className="aspect-[4/5] bg-muted animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-3 w-16 rounded bg-muted animate-pulse" />
                <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                <div className="h-9 w-full rounded-lg bg-muted animate-pulse mt-3" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
