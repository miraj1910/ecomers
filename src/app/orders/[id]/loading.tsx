import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"

export default function OrderDetailLoading() {
  return (
    <Section>
      <Container>
        <div className="mb-8">
          <div className="h-4 w-24 rounded-lg bg-muted animate-pulse mb-4" />
          <div className="h-9 w-48 rounded-lg bg-muted animate-pulse" />
          <div className="mt-2 h-5 w-64 rounded-lg bg-muted animate-pulse" />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-border p-6">
              <div className="h-6 w-16 rounded-lg bg-muted animate-pulse mb-4" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-4 py-4">
                    <div className="h-20 w-20 rounded-lg bg-muted animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 rounded-lg bg-muted animate-pulse" />
                      <div className="h-3 w-16 rounded-lg bg-muted animate-pulse" />
                    </div>
                    <div className="h-4 w-16 rounded-lg bg-muted animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-border p-6">
              <div className="h-6 w-20 rounded-lg bg-muted animate-pulse mb-4" />
              <div className="space-y-3">
                <div className="h-4 w-full rounded-lg bg-muted animate-pulse" />
                <div className="h-4 w-full rounded-lg bg-muted animate-pulse" />
              </div>
            </div>
            <div className="rounded-xl border border-border p-6">
              <div className="h-6 w-24 rounded-lg bg-muted animate-pulse mb-4" />
              <div className="h-6 w-20 rounded-lg bg-muted animate-pulse" />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
