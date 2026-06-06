import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"

export default function CategoryLoading() {
  return (
    <Section>
      <Container>
        <div className="mb-8">
          <div className="h-9 w-48 rounded-lg bg-muted animate-pulse" />
          <div className="mt-2 h-5 w-24 rounded-lg bg-muted animate-pulse" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-border">
              <div className="aspect-[4/5] bg-muted animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-3 w-16 rounded bg-muted animate-pulse" />
                <div className="h-4 w-36 rounded bg-muted animate-pulse" />
                <div className="h-4 w-20 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
