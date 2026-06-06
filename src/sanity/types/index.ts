export interface SanityProduct {
  _id: string
  name: string
  slug: string
  description?: string
  price: number
  comparePrice?: number
  images?: { url: string; alt?: string }[]
  image?: { url: string; alt?: string }
  category?: { _id: string; title: string; slug: string }
  tags?: string[]
  sizes?: string[]
  colors?: { name: string; hex: string }[]
  featured?: boolean
  stock?: number
}

export interface SanityCategory {
  _id: string
  title: string
  slug: string
  description?: string
  image?: { url: string; alt?: string }
}
