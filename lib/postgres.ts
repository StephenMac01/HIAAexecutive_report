import { ManagedIdentityCredential } from "@azure/identity";
import { Pool, type PoolConfig, type QueryResultRow } from "pg";

const credential = new ManagedIdentityCredential();

let pool: Pool | null = null;
let tokenExpiresAt = 0;

async function createPool(): Promise<Pool> {
  const token = await credential.getToken(
    "https://ossrdbms-aad.database.windows.net/.default",
  );

  if (!token?.token) {
    throw new Error(
      "The App Service managed identity could not obtain a PostgreSQL token.",
    );
  }

  const config: PoolConfig = {
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT ?? "5432"),
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: token.token,

    ssl: {
      rejectUnauthorized: true,
    },

    // Keep the pool small for the B1ms PostgreSQL server.
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 15_000,
  };

  tokenExpiresAt = token.expiresOnTimestamp - 5 * 60 * 1000;

  const newPool = new Pool(config);

  newPool.on("error", (error) => {
    console.error("Unexpected PostgreSQL pool error:", error);
    pool = null;
    tokenExpiresAt = 0;
  });

  return newPool;
}

async function getPool(): Promise<Pool> {
  const tokenExpired = !tokenExpiresAt || Date.now() >= tokenExpiresAt;

  if (!pool || tokenExpired) {
    if (pool) {
      await pool.end().catch(() => undefined);
    }

    pool = await createPool();
  }

  return pool;
}

export async function queryPostgres<T extends QueryResultRow>(
  sql: string,
  values: unknown[] = [],
): Promise<T[]> {
  const activePool = await getPool();
  const result = await activePool.query<T>(sql, values);

  return result.rows;
}
