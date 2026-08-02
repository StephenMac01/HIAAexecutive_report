import { NextResponse, type NextRequest } from "next/server"

/**
 * Route protection for Microsoft Entra ID via Azure App Service "Easy Auth".
 *
 * Easy Auth normally intercepts unauthenticated requests before they reach the
 * app. This proxy is a defense-in-depth backstop: when AUTH_REQUIRE_ENTRA=true
 * and a page request arrives WITHOUT a validated principal header, we redirect
 * to the Entra login endpoint and return the user to where they were going.
 *
 * It is a no-op unless AUTH_REQUIRE_ENTRA=true, so local dev and the v0 preview
 * (which have no Easy Auth in front) pass straight through to the dev-identity
 * fallback in lib/notifications/identity.ts.
 *
 * Next.js 16 runs this on the Node.js runtime.
 */

const PRINCIPAL_HEADER = "x-ms-client-principal"
const PRINCIPAL_ID_HEADER = "x-ms-client-principal-id"

export function proxy(request: NextRequest) {
  // Disabled by default → preview/dev behave exactly as before.
  if (process.env.AUTH_REQUIRE_ENTRA !== "true") {
    return NextResponse.next()
  }

  const { pathname, search } = request.nextUrl

  // Never guard the auth endpoints themselves, or API routes (they authenticate
  // independently — the cron evaluate route uses a shared secret).
  if (pathname.startsWith("/.auth") || pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  const authenticated =
    request.headers.has(PRINCIPAL_HEADER) || request.headers.has(PRINCIPAL_ID_HEADER)
  if (authenticated) {
    return NextResponse.next()
  }

  // Send the user through Entra login, then back to their original destination.
  const postLogin = encodeURIComponent(`${pathname}${search}`)
  const loginUrl = new URL(`/.auth/login/aad?post_login_redirect_uri=${postLogin}`, request.url)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  // Guard everything except Next internals and common static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp|woff2?)).*)"],
}
