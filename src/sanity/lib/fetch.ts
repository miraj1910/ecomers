import type { QueryParams } from "@sanity/client"
import { fetchSanity } from "./client"

export async function sanityFetch<QueryResult>({
  query,
  params = {},
  tags,
}: {
  query: string
  params?: QueryParams
  tags?: string[]
}): Promise<QueryResult> {
  void tags
  return fetchSanity<QueryResult>(query, params)
}
