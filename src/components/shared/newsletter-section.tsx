"use client"

import { useState } from "react"
import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"

export function NewsletterSection() {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setEmail("")
  }

  return (
    <Section>
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 border border-accent/20 mb-6">
            <Mail className="h-6 w-6 text-accent" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl text-foreground">
            Stay in the loop
          </h2>
          <p className="mt-3 text-sm text-secondary leading-relaxed max-w-md mx-auto">
            Subscribe to get notified about new arrivals, exclusive
            drops, and early access to sales.
          </p>
          <form
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
          >
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="sm:max-w-xs"
            />
            <Button type="submit" variant="default">
              Subscribe
            </Button>
          </form>
          <p className="mt-4 text-xs text-muted">
            No spam, unsubscribe at any time.
          </p>
        </div>
      </Container>
    </Section>
  )
}
