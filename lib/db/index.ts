import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

/**
 * Single shared pg Pool + Drizzle client for the whole app.
 *
 * The notification system is the only consumer of the database today. It is
 * intentionally decoupled from the KPI data path (SharePoint/xlsx), so a
 * database outage can never take down the dashboards — callers of the
 * notification layer must fail soft.
 */
const globalForDb = globalThis as unknown as { __kpiPool?: Pool }

function createPool(): Pool {
  const p = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 30_000,
    // TLS is negotiated from the `sslmode` in DATABASE_URL (Neon requires it).
  })
  // A pooled client can be terminated by the server (Neon closes idle
  // connections aggressively). Without an 'error' listener a background client
  // error becomes an unhandled rejection that poisons the next query. Handling
  // it lets the Pool quietly discard the dead client and hand out a fresh one.
  p.on("error", (err) => {
    console.log("[v0] pg pool idle-client error (recovering):", err.message)
  })
  return p
}

// Reuse a single Pool across HMR reloads in development so we don't leak
// connections, but always attach the error handler so a stale client can't
// crash the next query.
export const pool = globalForDb.__kpiPool ?? createPool()

if (process.env.NODE_ENV !== "production") globalForDb.__kpiPool = pool

export const db = drizzle(pool, { schema })

/** True when a database connection string is configured. */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL)
}
