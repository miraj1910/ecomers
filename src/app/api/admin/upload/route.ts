import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { rateLimitMiddleware } from "@/lib/security/rate-limit"
import { validateCsrf } from "@/lib/security/csrf"
import { uploadImage, deleteImage } from "@/lib/cloudinary"

export async function POST(request: Request) {
  const csrf = validateCsrf(request)
  if (csrf) return csrf

  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const rl = rateLimitMiddleware(`admin:upload:${session.user.id}`, { maxRequests: 30, interval: 60_000 })
  if (rl) return rl

  try {
    const body = await request.json()
    const { image: base64Image, folder } = body

    if (!base64Image || typeof base64Image !== "string") {
      return NextResponse.json({ error: "image (base64 string) is required" }, { status: 400 })
    }

    const url = await uploadImage(base64Image, folder ?? "ecommers/products")
    return NextResponse.json({ url })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const csrf = validateCsrf(request)
  if (csrf) return csrf

  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const rl = rateLimitMiddleware(`admin:upload:${session.user.id}`, { maxRequests: 30, interval: 60_000 })
  if (rl) return rl

  try {
    const body = await request.json()
    const { image: base64Image, oldUrl, folder } = body

    if (!base64Image || typeof base64Image !== "string") {
      return NextResponse.json({ error: "image (base64 string) is required" }, { status: 400 })
    }

    if (oldUrl) {
      await deleteImage(oldUrl).catch(() => {})
    }

    const url = await uploadImage(base64Image, folder ?? "ecommers/products")
    return NextResponse.json({ url })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Replace failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const csrf = validateCsrf(request)
  if (csrf) return csrf

  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const body = await request.json()
    const { url } = body

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "url is required" }, { status: 400 })
    }

    await deleteImage(url)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
