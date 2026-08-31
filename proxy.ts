import { NextResponse, type NextRequest } from "next/server";

/**
 * Browser-route protection for MSAL authentication.
 *
 * This proxy performs only a coarse presence check for the application's
 * signed session cookie.
 *
 * It does NOT validate the cookie contents. Full validation happens later in:
 *
 *   readSession()
 *      ↓
 *   getCurrentUser()
 *
 * API routes are also not redirected here. They are responsible for returning
 * their own 401 / 403 responses through the route guards.
 */

const SESSION_COOKIE = "hiaa_session";

/**
 * Routes that must always remain reachable without an application session.
 */
function isPublicPath(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/.auth")
  );
}

/**
 * API routes should never be redirected to an HTML login page.
 *
 * Authentication / authorization for APIs is enforced in the route handlers.
 */
function isApiPath(pathname: string): boolean {
  return pathname.startsWith("/api/");
}

/**
 * Protect browser page requests when MSAL mode is enabled.
 */
export function proxy(request: NextRequest) {
  /**
   * Auth disabled:
   *
   * Local development / preview mode continues to use the development
   * identity fallback.
   */
  if (process.env.NEXT_PUBLIC_AUTH_MODE !== "msal") {
    return NextResponse.next();
  }

  const { pathname, search } = request.nextUrl;

  /**
   * Login and authentication endpoints must remain public.
   */
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  /**
   * Do not redirect API requests.
   *
   * APIs should return 401 / 403 JSON responses instead.
   */
  if (isApiPath(pathname)) {
    return NextResponse.next();
  }

  /**
   * Coarse session-presence gate.
   *
   * A cookie existing here does NOT mean it is trusted.
   * The session signature and expiration are validated server-side by
   * readSession().
   */
  const sessionCookie = request.cookies.get(SESSION_COOKIE);

  if (sessionCookie?.value) {
    return NextResponse.next();
  }

  /**
   * No session cookie:
   *
   * Redirect the browser to /login and preserve the requested page so the
   * login client can return the user afterward.
   */
  const loginUrl = request.nextUrl.clone();

  loginUrl.pathname = "/login";

  /**
   * Prevent the login page itself from recursively becoming the destination.
   */
  const destination = `${pathname}${search}`;

  loginUrl.search = "";
  loginUrl.searchParams.set("next", destination);

  return NextResponse.redirect(loginUrl);
}

/**
 * Run the proxy for application pages while excluding Next.js internals and
 * common static assets.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|avif|css|js|map|woff|woff2|ttf|eot)).*)",
  ],
};
