import Link from "next/link"
import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

export function PromoBanner() {
  return (
    <Section>
      <Container>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-surface px-8 py-16 text-center sm:px-16 sm:py-24">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-accent/5 blur-[80px]" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-accent/3 blur-[80px]" />
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent mb-6">
              <Sparkles className="h-4 w-4" />
              Limited Time Offer
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Free shipping on orders over $100
            </h2>
            <p className="mt-4 text-base text-secondary max-w-xl mx-auto">
              Plus, enjoy 10% off your first order when you sign up for
              our newsletter.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/category/all">
                <Button
                  variant="default"
                  size="lg"
                >
                  Start Shopping
                </Button>
              </Link>
              <Link href="/sale">
                <Button
                  variant="link"
                  size="lg"
                >
                  View Sale
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
