import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"
import { GridSkeleton } from "@/components/shared/loading-skeleton"

export default function ProductsLoading() {
  return (
    <Section>
      <Container>
        <div className="mb-8">
          <div className="h-9 w-48 rounded-lg bg-muted animate-pulse" />
          <div className="mt-2 h-5 w-24 rounded-lg bg-muted animate-pulse" />
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="hidden w-56 shrink-0 lg:block">
            <div className="space-y-4">
              <div className="h-8 w-full rounded-lg bg-muted animate-pulse" />
              <div className="h-32 w-full rounded-lg bg-muted animate-pulse" />
              <div className="h-28 w-full rounded-lg bg-muted animate-pulse" />
            </div>
          </div>
          <div className="flex-1">
            <GridSkeleton count={6} columns={3} />
          </div>
        </div>
      </Container>
    </Section>
  )
}
