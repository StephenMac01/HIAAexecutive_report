import { NextResponse } from "next/server";

import { getPublicAuthError } from "@/lib/auth/easy-auth";
import { requireAdministrator } from "@/lib/auth/authorization";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const administrator = await requireAdministrator();

    const body: unknown = await request.json();

    /**
     * Validate body before using it.
     *
     * Replace this placeholder with your actual subscription operation.
     */
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json(
        {
          error: "A valid JSON object is required.",
          code: "INVALID_REQUEST",
        },
        { status: 400 },
      );
    }

    console.info("Administrator operation authorized", {
      actorOid: administrator.oid,
      actorEmail: administrator.email,
      actorRole: administrator.role,
    });

    // Perform the administrator-only database operation here.

    return NextResponse.json({
      success: true,
    });
  } catch (error: unknown) {
    const publicError = getPublicAuthError(error);

    return NextResponse.json(publicError.body, {
      status: publicError.status,
    });
  }
}
