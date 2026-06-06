import fs from "fs"
import path from "path"
import matter from "gray-matter"

const contentDir = path.join(process.cwd(), "content")

export function readMDXFile<T>(filePath: string) {
  const raw = fs.readFileSync(filePath, "utf-8")
  const { data, content } = matter(raw)
  return {
    frontmatter: data as T,
    content,
    slug: path.basename(filePath).replace(/\.mdx$/, ""),
  }
}

export function getMDXFiles(dir: string) {
  const fullPath = path.join(contentDir, dir)
  if (!fs.existsSync(fullPath)) return []
  return fs
    .readdirSync(fullPath)
    .filter((f) => f.endsWith(".mdx"))
    .sort()
}

export function getAllMDXContent<T>(dir: string) {
  const files = getMDXFiles(dir)
  return files.map((file) =>
    readMDXFile<T>(path.join(contentDir, dir, file))
  )
}

export function getMDXContentBySlug<T>(dir: string, slug: string) {
  const filePath = path.join(contentDir, dir, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null
  return readMDXFile<T>(filePath)
}

export function getAllSlugs(dir: string) {
  const files = getMDXFiles(dir)
  return files.map((f) => f.replace(/\.mdx$/, ""))
}
