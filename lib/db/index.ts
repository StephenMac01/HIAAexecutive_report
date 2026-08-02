import { readFileSync } from "node:fs"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool, type PoolConfig } from "pg"
import * as schema from "./schema"

/**
 * Single shared pg Pool + Drizzle client for the whole app, targeting
 * Azure Database for PostgreSQL Flexible Server.
 *
 * Azure Flexible Server speaks standard PostgreSQL wire protocol, so the plain
 * `pg` driver connects with no Azure-specific driver. Two things are made
 * explicit here because Azure requires them:
 *   1. TLS is always on and verified (Azure mandates encrypted connections).
 *   2. Auth is either a password in DATABASE_URL, or — when
 *      AZURE_PG_USE_ENTRA=true — a short-lived Microsoft Entra ID access token
 *      fetched per connection via the app's managed identity.
 *
 * The notification system is the only consumer of the database today. It is
 * intentionally decoupled from the KPI data path (SharePoint/xlsx), so a
 * database outage can never take down the dashboards — callers of the
 * notification layer must fail soft.
 */
const globalForDb = globalThis as unknown as { __kpiPool?: Pool }

// Entra ID scope for Azure Database for PostgreSQL. The returned token is used
// as the connection password when AZURE_PG_USE_ENTRA is enabled.
const AZURE_PG_ENTRA_SCOPE = "https://ossrdbms-aad.database.windows.net/.default"

/**
 * Build the TLS config. Azure Flexible Server certificates chain to well-known
 * public roots already present in Node's trust store, so verified TLS works out
 * of the box. An explicit CA bundle can be supplied via AZURE_PG_SSL_CA (either
 * inline PEM text or a file path) for pinned/verify-full setups.
 */
function buildSsl(): PoolConfig["ssl"] {
  const ca = process.env.AZURE_PG_SSL_CA
  if (ca && ca.trim()) {
    const cert = ca.includes("BEGIN CERTIFICATE") ? ca : readFileSync(ca, "utf8")
    return { ca: cert, rejectUnauthorized: true }
  }
  // Escape hatch for non-production/edge cases only (e.g. self-signed proxy).
  if (process.env.AZURE_PG_SSL_NO_VERIFY === "true") {
    return { rejectUnauthorized: false }
  }
  return { rejectUnauthorized: true }
}

/**
 * Fetch a fresh Entra ID access token to use as the PostgreSQL password.
 * `pg` accepts an async `password` function and calls it for each new
 * connection, so token refresh is handled naturally as the pool grows.
 * Uses DefaultAzureCredential → works with a managed identity in Azure App
 * Service and with `az login` / env credentials locally.
 */
async function getEntraToken(): Promise<string> {
  const { DefaultAzureCredential } = await import("@azure/identity")
  const credential = new DefaultAzureCredential()
  const token = await credential.getToken(AZURE_PG_ENTRA_SCOPE)
  if (!token?.token) {
    throw new Error("Failed to acquire an Entra ID access token for PostgreSQL.")
  }
  return token.token
}

function createPool(): Pool {
  const useEntra = process.env.AZURE_PG_USE_ENTRA === "true"

  const config: PoolConfig = {
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 30_000,
    ssl: buildSsl(),
    // When Entra auth is on, the password is a per-connection access token
    // rather than a static secret embedded in DATABASE_URL.
    ...(useEntra ? { password: getEntraToken } : {}),
  }

  const p = new Pool(config)

  // Azure can terminate idle backend connections (idle timeout / maintenance /
  // failover on Flexible Server). Without an 'error' listener a background
  // client error becomes an unhandled rejection that poisons the next query.
  // Handling it lets the Pool quietly discard the dead client and hand out a
  // fresh one.
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
