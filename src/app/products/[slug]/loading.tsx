import { Container } from "@/components/layout/container"

export default function ProductDetailLoading() {
  return (
    <Container>
      <div className="h-5 w-64 rounded-lg bg-muted animate-pulse my-6" />

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-4">
          <div className="aspect-[4/5] rounded-xl bg-muted animate-pulse" />
          <div className="aspect-[4/5] rounded-xl bg-muted animate-pulse" />
        </div>

        <div className="pt-4 lg:pt-12">
          <div className="h-4 w-20 rounded-lg bg-muted animate-pulse mb-2" />
          <div className="h-8 w-72 rounded-lg bg-muted animate-pulse mb-4" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded-lg bg-muted animate-pulse" />
            <div className="h-4 w-3/4 rounded-lg bg-muted animate-pulse" />
          </div>
          <div className="mt-6 h-8 w-32 rounded-lg bg-muted animate-pulse" />
          <div className="mt-8 h-12 w-full rounded-xl bg-muted animate-pulse" />
        </div>
      </div>
    </Container>
  )
}
