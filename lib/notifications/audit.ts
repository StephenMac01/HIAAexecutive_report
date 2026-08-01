import "server-only"

import { randomUUID } from "crypto"
import { db } from "@/lib/db"
import { auditLog } from "@/lib/db/schema"

/**
 * Append an immutable audit record. Never throws — audit failures must not
 * break the action being audited.
 */
export async function writeAudit(entry: {
  actorUserId: string | null
  action: string
  entityType: string
  entityId?: string | null
  metadata?: Record<string, unknown>
}): Promise<void> {
  try {
    await db.insert(auditLog).values({
      id: randomUUID(),
      actorUserId: entry.actorUserId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      metadata: entry.metadata ?? null,
    })
  } catch (err) {
    console.log("[v0] writeAudit failed:", err instanceof Error ? err.message : err)
  }
}
