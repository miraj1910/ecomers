import type { ImageLoaderProps } from "next/image"

const UNSAFE_CHARS = /[<>"']/g

function safeParam(value: string): string {
  return value.replace(UNSAFE_CHARS, "")
}

export default function imageLoader({ src, width, quality }: ImageLoaderProps) {
  const safeSrc = safeParam(src)

  if (safeSrc.startsWith("https://images.unsplash.com/")) {
    const url = new URL(safeSrc)
    url.searchParams.set("w", String(width))
    url.searchParams.set("q", String(quality ?? 75))
    url.searchParams.set("fit", "crop")
    return url.toString()
  }

  if (safeSrc.startsWith("https://cdn.sanity.io/")) {
    const url = new URL(safeSrc)
    url.searchParams.set("w", String(width))
    url.searchParams.set("q", String(quality ?? 75))
    return url.toString()
  }

  if (safeSrc.startsWith("https://lh3.googleusercontent.com/")) {
    const url = new URL(safeSrc)
    url.searchParams.set("w", String(width))
    url.searchParams.set("q", String(quality ?? 75))
    return url.toString()
  }

  if (safeSrc.startsWith("http")) {
    return `/_next/image?url=${encodeURIComponent(safeSrc)}&w=${width}&q=${quality ?? 75}`
  }

  return `/_next/image?url=${encodeURIComponent(safeSrc)}&w=${width}&q=${quality ?? 75}`
}
