import { redirect } from "next/navigation"

/**
 * Canonical dashboard lives at "/". This alias exists so that any link or
 * post-login redirect targeting "/dashboard" (e.g. an alternate environment or
 * a bookmarked URL) resolves to the real dashboard instead of 404ing.
 */
export default function DashboardAlias() {
  redirect("/")
}
