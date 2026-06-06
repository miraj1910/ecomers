import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const protectedPaths = ["/profile", "/wishlist", "/orders", "/admin"]

const publicPaths = ["/checkout/success", "/checkout/cancel"]

export const config = {
  matcher: ["/profile/:path*", "/wishlist/:path*", "/orders/:path*", "/checkout/:path*", "/admin/:path*"],
}

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  const isPublic = publicPaths.some((path) => pathname.startsWith(path))
  if (isPublic) {
    return NextResponse.next()
  }

  const session = await auth()

  if (pathname.startsWith("/admin")) {
    if (!session?.user) {
      const url = request.nextUrl.clone()
      url.pathname = "/sign-in"
      return NextResponse.redirect(url)
    }
    if (session.user.role !== "ADMIN") {
      const url = request.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path))

  if (isProtected && !session?.user) {
    const url = request.nextUrl.clone()
    url.pathname = "/sign-in"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}
