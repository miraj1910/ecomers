import { createClient, type QueryParams } from "@sanity/client"
import imageUrlBuilder, { type SanityImageSource } from "@sanity/image-url"

function getClient() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production"

  if (!projectId) {
    throw new Error(
      "Sanity is not configured. Set NEXT_PUBLIC_SANITY_PROJECT_ID to use Sanity."
    )
  }

  return createClient({
    projectId,
    dataset,
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-01-01",
    useCdn: true,
    perspective: "published",
  })
}

function getBuilder() {
  return imageUrlBuilder(getClient())
}

export function urlFor(source: SanityImageSource) {
  return getBuilder().image(source)
}

export function fetchSanity<T>(query: string, params: QueryParams = {}) {
  const client = getClient()
  return client.fetch<T>(query, params)
}

export function isSanityConfigured() {
  return !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
}
