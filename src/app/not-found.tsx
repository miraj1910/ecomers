import Link from "next/link"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <Container>
      <div className="mx-auto max-w-md py-24 text-center">
        <h1 className="font-serif text-8xl font-normal text-text-primary tracking-tight">404</h1>
        <p className="mt-6 text-sm text-text-secondary">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <div className="mt-10">
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    </Container>
  )
}
