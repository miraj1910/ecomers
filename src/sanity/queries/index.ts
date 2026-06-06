export const productsQuery = `*[_type == "product"] | order(_createdAt desc) {
  _id,
  name,
  "slug": slug.current,
  description,
  price,
  comparePrice,
  "images": images[] { "url": asset->url, "alt": alt },
  "category": category-> { _id, title, "slug": slug.current },
  tags,
  sizes,
  colors,
  featured,
  stock
}`

export const featuredProductsQuery = `*[_type == "product" && featured == true] | order(_createdAt desc) [0...4] {
  _id,
  name,
  "slug": slug.current,
  price,
  comparePrice,
  "image": images[0] { "url": asset->url, "alt": alt },
  "category": category-> { _id, title, "slug": slug.current },
  featured,
  stock
}`

export const productBySlugQuery = `*[_type == "product" && slug.current == $slug][0] {
  _id,
  name,
  "slug": slug.current,
  description,
  price,
  comparePrice,
  "images": images[] { "url": asset->url, "alt": alt },
  "category": category-> { _id, title, "slug": slug.current },
  tags,
  sizes,
  colors,
  featured,
  stock
}`

export const productsByCategoryQuery = `*[_type == "product" && category->slug.current == $slug] | order(_createdAt desc) {
  _id,
  name,
  "slug": slug.current,
  price,
  comparePrice,
  "image": images[0] { "url": asset->url, "alt": alt },
  "category": category-> { _id, title, "slug": slug.current },
  featured,
  stock
}`

export const searchProductsQuery = `*[_type == "product" && (name match $q || tags[] match $q)] | order(_createdAt desc) [0...$limit] {
  _id,
  name,
  "slug": slug.current,
  price,
  comparePrice,
  "image": images[0] { "url": asset->url, "alt": alt },
  "category": category-> { _id, title, "slug": slug.current },
  featured,
  stock
}`

export const relatedProductsQuery = `*[_type == "product" && category->slug.current == $slug && slug.current != $currentSlug] | order(_createdAt desc) [0...4] {
  _id,
  name,
  "slug": slug.current,
  price,
  comparePrice,
  "image": images[0] { "url": asset->url, "alt": alt },
  "category": category-> { _id, title, "slug": slug.current },
  featured,
  stock
}`

export const categoriesQuery = `*[_type == "category"] | order(title asc) {
  _id,
  title,
  "slug": slug.current,
  description,
  "image": image { "url": asset->url, "alt": alt }
}`

export const productIdsQuery = `*[_type == "product" && defined(slug.current)] { "slug": slug.current }`
