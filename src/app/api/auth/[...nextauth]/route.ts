import { handlers } from "@/lib/auth"
import type { NextRequest } from "next/server"

async function loggedHandler(
  req: NextRequest,
  method: "GET" | "POST"
): Promise<Response> {
  const fn = method === "GET" ? handlers.GET : handlers.POST
  try {
    return await fn(req)
  } catch (e) {
    console.error("[auth/route] Unhandled error in", method, ":", e)
    throw e
  }
}

export const GET = (req: NextRequest) => loggedHandler(req, "GET")

export const POST = (req: NextRequest) => loggedHandler(req, "POST")
