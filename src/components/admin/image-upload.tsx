"use client"

import { useState, useCallback } from "react"
import { Upload, X, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
}

export function ImageUpload({ images, onChange, maxImages = 10 }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === "dragenter" || e.type === "dragover")
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      )
      processFiles(files)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [images, onChange, maxImages]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []).filter((f) =>
        f.type.startsWith("image/")
      )
      processFiles(files)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [images, onChange, maxImages]
  )

  const processFiles = async (files: File[]) => {
    const remaining = maxImages - images.length
    const toProcess = files.slice(0, remaining)

    const newImages: string[] = []
    for (const file of toProcess) {
      const url = await readFileAsDataURL(file)
      newImages.push(url)
    }

    if (newImages.length > 0) {
      onChange([...images, ...newImages])
    }
  }

  const removeImage = useCallback(
    (index: number) => {
      const updated = images.filter((_, i) => i !== index)
      onChange(updated)
    },
    [images, onChange]
  )

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
          {images.map((url, index) => (
            <div key={index} className="group relative aspect-square overflow-hidden rounded-xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length < maxImages && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-8 transition-colors hover:border-accent/50",
            dragActive && "border-accent bg-accent/5"
          )}
        >
          <label className="flex cursor-pointer flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground/[0.06]">
              {dragActive ? (
                <Upload className="h-5 w-5 text-accent" />
              ) : (
                <ImageIcon className="h-5 w-5 text-secondary" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                {dragActive ? "Drop images here" : "Upload images"}
              </p>
              <p className="mt-0.5 text-xs text-secondary">
                Drag & drop or click to browse
              </p>
            </div>
            <span className="text-xs text-muted">
              {images.length}/{maxImages} images
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  )
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
