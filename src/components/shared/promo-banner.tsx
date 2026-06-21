import Link from "next/link"
import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"
import { Button } from "@/components/ui/button"

export function PromoBanner() {
  return (
    <Section>
      <Container>
        <div className="bg-text-primary px-12 py-16 text-center sm:py-20">
          <span className="text-[0.65rem] font-medium tracking-[0.2em] uppercase text-white/50">Offer</span>
          <h2 className="heading-section mt-4 text-white">
            Free shipping on orders over $100
          </h2>
          <p className="mt-4 text-sm text-white/60 max-w-md mx-auto">
            Plus, enjoy 10% off your first order when you sign up for our newsletter.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/category/all">
              <Button variant="primary" size="lg" className="bg-white text-text-primary hover:bg-white/90">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  )
}
