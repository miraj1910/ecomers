import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 })
    }

    const { id, name, value } = body

    if (!id || !name || typeof value !== "number") {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 })
    }

    if (process.env.NODE_ENV === "development") {
      console.log(`[Web Vitals] ${name}: ${value.toFixed(2)}ms`)
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 })
  }
}
