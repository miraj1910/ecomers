"use client"

import { useState, useRef, useCallback } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ProductGalleryProps {
  images: { url: string; alt?: string }[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [zoom, setZoom] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setMousePos({ x, y })
    },
    []
  )

  const current = images[selectedIndex]
  if (!current) return null

  return (
    <div className="grid gap-4">
      <div
        ref={containerRef}
        className="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted cursor-crosshair"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={handleMouseMove}
        role="img"
        aria-label={current.alt ?? productName}
      >
        <Image
          src={current.url}
          alt={current.alt ?? productName}
          fill
          preload
          className="object-cover transition-transform duration-200"
          style={{
            transform: zoom ? "scale(1.8)" : "scale(1)",
            transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
          }}
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>

      {images.length > 1 && (
        <div
          className="flex gap-3 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Product image thumbnails"
        >
          {images.map((img, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === selectedIndex}
              aria-label={img.alt ?? `View image ${i + 1}`}
              onClick={() => setSelectedIndex(i)}
              className={cn(
                "relative aspect-square w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-muted transition-colors",
                i === selectedIndex
                  ? "border-foreground"
                  : "border-border hover:border-muted-foreground/50"
              )}
            >
              <Image
                src={img.url}
                alt={img.alt ?? `${productName} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
