"use client"

import { useState, useCallback, useEffect } from "react"

const STORAGE_KEY = "recently_viewed"
const MAX_ITEMS = 12

export type RecentlyViewedItem = {
  slug: string
  name: string
  price: number
  image: string | null
  category: string | null
}

function loadFromStorage(): RecentlyViewedItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as RecentlyViewedItem[]
  } catch {
    return []
  }
}

function saveToStorage(items: RecentlyViewedItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {}
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([])

  useEffect(() => {
    setItems(loadFromStorage())
  }, [])

  const addItem = useCallback((item: RecentlyViewedItem) => {
    setItems((prev) => {
      const filtered = prev.filter((i) => i.slug !== item.slug)
      const updated = [item, ...filtered].slice(0, MAX_ITEMS)
      saveToStorage(updated)
      return updated
    })
  }, [])

  const clearItems = useCallback(() => {
    setItems([])
    saveToStorage([])
  }, [])

  return { items, addItem, clearItems }
}
