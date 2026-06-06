export interface ProductFrontmatter {
  title: string
  slug: string
  description: string
  price: number
  comparePrice?: number
  category: string
  image: string
  images: string[]
  tags: string[]
  sizes: string[]
  featured: boolean
  inStock: boolean
  rating: number
  reviewCount: number
  badge?: string | null
}

export interface CategoryFrontmatter {
  title: string
  slug: string
  description: string
  image: string
}

export interface BlogFrontmatter {
  title: string
  slug: string
  date: string
  description: string
  coverImage: string
  tags: string[]
  published: boolean
  author?: string
}

export interface PageFrontmatter {
  title: string
  slug: string
  description: string
}

export interface MDXContent<T> {
  frontmatter: T
  content: string
  slug: string
}
