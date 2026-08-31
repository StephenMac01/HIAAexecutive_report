import { NextResponse } from "next/server"
import { evaluateAndDispatch } from "@/lib/notifications/evaluate"

/**
 * Scheduled / external trigger for the alert evaluation engine.
 *
 * Protect with `NOTIFICATIONS_CRON_SECRET`: callers must send
 * `Authorization: Bearer <secret>`. When the secret is unset the endpoint is
 * disabled (503) so it can never run unauthenticated in production. This is
 * where an Azure scheduled job / Power Automate flow will call in.
 */
export const dynamic = "force-dynamic"

function authorized(req: Request): boolean {
  const secret = process.env.NOTIFICATIONS_CRON_SECRET
  if (!secret) return false
  const header = req.headers.get("authorization") ?? ""
  return header === `Bearer ${secret}`
}

export async function POST(req: Request) {
  if (!process.env.NOTIFICATIONS_CRON_SECRET) {
    return NextResponse.json({ error: "evaluation endpoint disabled: set NOTIFICATIONS_CRON_SECRET" }, { status: 503 })
  }
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  try {
    const result = await evaluateAndDispatch(null)
    return NextResponse.json(result)
  } catch (err) {
    console.log("[kpi] evaluate route failed:", err instanceof Error ? err.message : err)
    return NextResponse.json({ error: "evaluation failed" }, { status: 500 })
  }
}
