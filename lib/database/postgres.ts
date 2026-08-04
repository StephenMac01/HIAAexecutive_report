import { ManagedIdentityCredential } from "@azure/identity";
import {
  Pool,
  type PoolClient,
  type PoolConfig,
  type QueryResultRow,
} from "pg";

const POSTGRES_SCOPE = "https://ossrdbms-aad.database.windows.net/.default";

/**
 * Uses the system-assigned managed identity attached to Azure App Service.
 *
 * No client ID is required for a system-assigned identity.
 */
const credential = new ManagedIdentityCredential();

let pool: Pool | null = null;

function requiredEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getPort(): number {
  const rawPort = process.env.PGPORT?.trim() || "5432";
  const port = Number(rawPort);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(
      `PGPORT must be a valid TCP port between 1 and 65535. Received: ${rawPort}`,
    );
  }

  return port;
}

/**
 * Retrieves a fresh Microsoft Entra access token.
 *
 * Azure Database for PostgreSQL accepts this token in the PostgreSQL
 * password field.
 */
async function getPostgresAccessToken(): Promise<string> {
  const accessToken = await credential.getToken(POSTGRES_SCOPE);

  const token = accessToken?.token?.trim();

  if (!token) {
    throw new Error(
      "Managed Identity returned an empty Azure PostgreSQL access token.",
    );
  }

  return token;
}

function createPool(): Pool {
  const host = requiredEnvironmentVariable("PGHOST");
  const database = requiredEnvironmentVariable("PGDATABASE");
  const user = requiredEnvironmentVariable("PGUSER");
  const port = getPort();

  const config: PoolConfig = {
    host,
    port,
    database,
    user,

    /*
     * node-postgres invokes this callback whenever it creates a new
     * database connection. This prevents expired Entra tokens from being
     * reused and guarantees that the password is a non-empty token.
     */
    password: getPostgresAccessToken,

    ssl: {
      rejectUnauthorized: true,
    },

    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 15_000,
    allowExitOnIdle: false,
    application_name: "hiaaexecutivereport-v2",
  };

  const newPool = new Pool(config);

  newPool.on("error", (error: Error) => {
    console.error("[postgres] Unexpected idle client error:", error);
  });

  newPool.on("connect", () => {
    console.log("[postgres] Connected using App Service managed identity.");
  });

  return newPool;
}

function getPool(): Pool {
  if (!pool) {
    pool = createPool();
  }

  return pool;
}

/**
 * Runs a parameterized PostgreSQL query and returns its rows.
 */
export async function queryPostgres<T extends QueryResultRow>(
  sql: string,
  values: readonly unknown[] = [],
): Promise<T[]> {
  const activePool = getPool();

  try {
    const result = await activePool.query<T>(sql, Array.from(values));

    return result.rows;
  } catch (error) {
    console.error("[postgres] Query failed:", {
      message: error instanceof Error ? error.message : String(error),
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
    });

    throw error;
  }
}

/**
 * Returns a dedicated client for transactions.
 *
 * Always release it in a finally block:
 *
 * const client = await getPostgresClient();
 * try {
 *   await client.query("BEGIN");
 *   // queries...
 *   await client.query("COMMIT");
 * } catch (error) {
 *   await client.query("ROLLBACK");
 *   throw error;
 * } finally {
 *   client.release();
 * }
 */
export async function getPostgresClient(): Promise<PoolClient> {
  return getPool().connect();
}

/**
 * Closes the PostgreSQL pool.
 *
 * Primarily useful in scripts and tests. A continuously running App Service
 * normally keeps the pool open for the process lifetime.
 */
export async function closePostgresPool(): Promise<void> {
  if (!pool) {
    return;
  }

  const activePool = pool;
  pool = null;

  await activePool.end();
}

/**
 * Small health check for deployment verification.
 */
export async function checkPostgresConnection(): Promise<{
  connected: true;
  databaseTime: string;
  databaseUser: string;
  databaseName: string;
}> {
  const rows = await queryPostgres<{
    database_time: Date | string;
    database_user: string;
    database_name: string;
  }>(
    `
      SELECT
        NOW() AS database_time,
        CURRENT_USER AS database_user,
        CURRENT_DATABASE() AS database_name
    `,
  );

  const row = rows[0];

  if (!row) {
    throw new Error("PostgreSQL health check returned no rows.");
  }

  return {
    connected: true,
    databaseTime:
      row.database_time instanceof Date
        ? row.database_time.toISOString()
        : String(row.database_time),
    databaseUser: row.database_user,
    databaseName: row.database_name,
  };
}
