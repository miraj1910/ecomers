"use client"

import { useState } from "react"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function NewsletterSection() {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setEmail("")
  }

  return (
    <section className="bg-bg-warm py-32">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-xl text-center"
        >
          <span className="meta">Stay Connected</span>
          <h2 className="heading-section mt-4 text-text-primary">
            Join Our Newsletter
          </h2>
          <p className="mt-4 text-base leading-relaxed text-text-secondary max-w-md mx-auto">
            Subscribe to receive early access to new collections, exclusive drops, and curated stories.
          </p>
          <form
            onSubmit={handleSubmit}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center"
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-14 flex-1 min-w-0 bg-transparent border-b border-border-subtle px-0 text-base text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-text-primary transition-colors"
            />
            <Button type="submit" variant="primary" size="lg">
              Subscribe
            </Button>
          </form>
          <p className="mt-6 text-xs text-text-muted">
            No spam, unsubscribe at any time.
          </p>
        </motion.div>
      </Container>
    </section>
  )
}
