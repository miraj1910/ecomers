import Link from "next/link"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <Container>
      <div className="bg-surface border border-border mx-auto my-20 max-w-md rounded-3xl px-8 py-16 text-center">
        <h1 className="mb-2 text-6xl font-bold tracking-tight text-white">404</h1>
        <p className="mb-8 text-secondary">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/">
          <Button size="lg">Go Home</Button>
        </Link>
      </div>
    </Container>
  )
}
