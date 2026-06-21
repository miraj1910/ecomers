"use client"

import { useState, useCallback, useRef } from "react"
import { Upload, X, ImageIcon, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
}

async function uploadToCloudinary(file: File): Promise<string> {
  const base64 = await readFileAsBase64(file)
  const res = await fetch("/api/admin/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: base64, folder: "ecommers/products" }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Upload failed" }))
    throw new Error(err.error || "Upload failed")
  }
  const data = await res.json()
  return data.url
}

async function replaceOnCloudinary(oldUrl: string, file: File): Promise<string> {
  const base64 = await readFileAsBase64(file)
  const res = await fetch("/api/admin/upload", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: base64, oldUrl, folder: "ecommers/products" }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Replace failed" }))
    throw new Error(err.error || "Replace failed")
  }
  const data = await res.json()
  return data.url
}

async function deleteFromCloudinary(url: string): Promise<void> {
  await fetch("/api/admin/upload", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  }).catch(() => {})
}

export function ImageUpload({ images, onChange, maxImages = 10 }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null)
  const replaceInputRef = useRef<HTMLInputElement>(null)

  const processFiles = async (files: File[]) => {
    const remaining = maxImages - images.length
    const toProcess = files.slice(0, remaining)

    setError(null)
    setUploading(true)

    const newImages: string[] = []
    for (const file of toProcess) {
      try {
        const url = await uploadToCloudinary(file)
        newImages.push(url)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed")
        break
      }
    }

    if (newImages.length > 0) {
      onChange([...images, ...newImages])
    }
    setUploading(false)
  }

  const handleReplace = useCallback(
    async (index: number, file: File) => {
      const oldUrl = images[index]
      setError(null)
      setReplacingIndex(index)
      try {
        const newUrl = await replaceOnCloudinary(oldUrl, file)
        const updated = [...images]
        updated[index] = newUrl
        onChange(updated)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Replace failed")
      }
      setReplacingIndex(null)
    },
    [images, onChange]
  )

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
      const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"))
      processFiles(files)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [images, onChange, maxImages]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/"))
      processFiles(files)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [images, onChange, maxImages]
  )

  const handleReplaceInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file && replacingIndex !== null) {
        handleReplace(replacingIndex, file)
      }
      if (replaceInputRef.current) {
        replaceInputRef.current.value = ""
      }
    },
    [replacingIndex, handleReplace]
  )

  const removeImage = useCallback(
    async (index: number) => {
      const url = images[index]
      onChange(images.filter((_, i) => i !== index))
      deleteFromCloudinary(url)
    },
    [images, onChange]
  )

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/12 px-4 py-2 text-sm text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
          {images.map((url, index) => (
            <div key={url + index} className="group relative aspect-square overflow-hidden rounded-xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-background/40 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => {
                    setReplacingIndex(index)
                    replaceInputRef.current?.click()
                  }}
                  disabled={uploading || replacingIndex !== null}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/20 text-foreground transition-colors hover:bg-foreground/40 disabled:opacity-50"
                  title="Replace image"
                >
                  {replacingIndex === index ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  disabled={uploading || replacingIndex !== null}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/20 text-foreground transition-colors hover:bg-error/60 disabled:opacity-50"
                  title="Delete image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        onChange={handleReplaceInput}
        className="hidden"
      />

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
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-accent" />
              ) : dragActive ? (
                <Upload className="h-5 w-5 text-accent" />
              ) : (
                <ImageIcon className="h-5 w-5 text-secondary" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                {uploading ? "Uploading..." : dragActive ? "Drop images here" : "Upload images"}
              </p>
              <p className="mt-0.5 text-xs text-secondary">
                {uploading ? "Uploading to Cloudinary..." : "Drag & drop or click to browse"}
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
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  )
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
