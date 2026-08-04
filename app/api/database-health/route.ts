import { NextResponse } from "next/server";
import { queryPostgres } from "@/lib/database/postgres";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface HealthRow {
  database_name: string;
  database_user: string;
  server_time: string;
}

export async function GET() {
  try {
    const rows = await queryPostgres<HealthRow>(`
      SELECT
        current_database() AS database_name,
        current_user AS database_user,
        NOW()::text AS server_time
    `);

    return NextResponse.json({
      status: "healthy",
      database: rows[0]?.database_name,
      user: rows[0]?.database_user,
      serverTime: rows[0]?.server_time,
    });
  } catch (error) {
    console.error("PostgreSQL health check failed:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        message: "The application could not connect to PostgreSQL.",
      },
      { status: 503 },
    );
  }
}
