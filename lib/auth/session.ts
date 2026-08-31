import "server-only";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@/lib/notifications/types";

/**
 * Durable server session for browser-only (MSAL) auth.
 *
 * After the client validates an Entra token via /api/auth/session, we mint our
 * OWN short-lived, signed (HS256) session token and store it in an httpOnly,
 * Secure, SameSite=Lax cookie. Server Components, Route Handlers, and Server
 * Actions then read the already-verified identity from this cookie via
 * `readSession()` — the browser never sends the raw Entra token again, and no
 * token is exposed to client JS.
 */

export const SESSION_COOKIE = "hiaa_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

export type SessionPayload = {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  appRoles: string[];
};

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "SESSION_SECRET is not set (min 16 chars). Required for MSAL browser auth.",
    );
  }
  return new TextEncoder().encode(secret);
}

/** Sign the identity into a JWT and set it as the session cookie. */
export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await new SignJWT({
    email: payload.email,
    displayName: payload.displayName,
    role: payload.role,
    appRoles: payload.appRoles,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecret());

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

function isRole(value: unknown): value is Role {
  return value === "admin" || value === "manager" || value === "viewer";
}

/** Verify and decode the session cookie. Returns null when absent/invalid. */
export async function readSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;

  if (!raw) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(raw, getSecret(), {
      algorithms: ["HS256"],
    });

    const sub = typeof payload.sub === "string" ? payload.sub : "";

    if (!sub) {
      return null;
    }

    if (!isRole(payload.role)) {
      console.warn("[auth] Session contains invalid or missing role.");
      return null;
    }

    return {
      id: sub,

      email: typeof payload.email === "string" ? payload.email : "",

      displayName:
        typeof payload.displayName === "string" ? payload.displayName : "",

      role: payload.role,

      appRoles: Array.isArray(payload.appRoles)
        ? payload.appRoles.filter(
            (role): role is string => typeof role === "string",
          )
        : [],
    };
  } catch (error) {
    console.warn(
      "[auth] Invalid session cookie:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

/** Clear the session cookie (logout). */
export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
