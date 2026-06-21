"use client"

import { useEffect } from "react"
import { useRecentlyViewed } from "@/hooks/use-recently-viewed"

interface RecentlyViewedTrackerProps {
  slug: string
  name: string
  price: number
  image: string | null
  category: string | null
}

export function RecentlyViewedTracker({
  slug,
  name,
  price,
  image,
  category,
}: RecentlyViewedTrackerProps) {
  const { addItem } = useRecentlyViewed()

  useEffect(() => {
    addItem({ slug, name, price, image, category })
  }, [slug, name, price, image, category, addItem])

  return null
}
