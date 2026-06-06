import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"

export default function ProfileLoading() {
  return (
    <Section>
      <Container>
        <div className="h-8 w-32 rounded-lg bg-muted animate-pulse mb-8" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-border p-6">
              <div className="h-5 w-40 rounded bg-muted animate-pulse mb-4" />
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i}>
                    <div className="h-3 w-16 rounded bg-muted animate-pulse mb-1" />
                    <div className="h-4 w-48 rounded bg-muted animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border p-6">
            <div className="h-4 w-24 rounded bg-muted animate-pulse mb-3" />
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-8 w-full rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
