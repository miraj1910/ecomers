import { handlers } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { NextRequest } from "next/server"

export const runtime = "nodejs"

function dumpChain(err: unknown, depth = 0): string {
  if (!err || depth > 5) return ""
  const indent = "  ".repeat(depth)
  const tag = depth === 0 ? "[auth/route]" : "[cause]"
  let out = `${tag}${indent ? " " + indent : ""}`
  if (err instanceof Error) {
    out += `${err.name}: ${err.message}`
    if (err.stack) {
      const lines = err.stack.split("\n").slice(1).filter((l) => !l.includes("node_modules"))
      if (lines.length) out += "\n" + lines.join("\n")
    }
    if (err.cause) out += "\n" + dumpChain(err.cause, depth + 1)
  } else {
    out += String(err)
  }
  return out
}

async function checkDb(): Promise<void> {
  try {
    const start = Date.now()
    await prisma.$queryRaw`SELECT 1`
    console.log("[auth/route] DB health check OK", `${Date.now() - start}ms`)
  } catch (e) {
    console.error("[auth/route] DB health check FAILED:", dumpChain(e))
  }
}

async function loggedHandler(
  req: NextRequest,
  method: "GET" | "POST"
): Promise<Response> {
  const url = new URL(req.url)
  const isCallback = url.pathname.includes("/callback/")

  // Run health check in the background for callbacks (don't block the request)
  if (isCallback) {
    checkDb()
  }

  const fn = method === "GET" ? handlers.GET : handlers.POST
  try {
    return await fn(req)
  } catch (e) {
    console.error("[auth/route] Unhandled error:", dumpChain(e))
    throw e
  }
}

export const GET = (req: NextRequest) => loggedHandler(req, "GET")

export const POST = (req: NextRequest) => loggedHandler(req, "POST")
