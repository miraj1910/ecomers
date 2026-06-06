import type { JsonLd } from "@/lib/seo/json-ld"

interface JsonLdScriptProps {
  data: JsonLd | JsonLd[]
}

function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003C").replace(/>/g, "\\u003E").replace(/&/g, "\\u0026")
}

export function JsonLdScript({ data }: JsonLdScriptProps) {
  const json = Array.isArray(data) ? data : [data]
  const content = json.length === 1 ? json[0] : json

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(content) }}
    />
  )
}
