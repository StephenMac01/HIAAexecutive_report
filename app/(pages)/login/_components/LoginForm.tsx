"use client";

import Image from "next/image";
import Link from "next/link";
import { LogIn, Loader2, ShieldAlert, CheckCircle2, Info } from "lucide-react";

type BannerKind = "success" | "warning" | "info";

export type LoginFormProps = {
  /** Optional status banner (e.g. logged-out / access-denied notices). */
  message?: string;
  messageKind?: BannerKind;
  /** Inline error text shown under the button. */
  error?: string;
  /** True while sign-in / session exchange is running. */
  busy?: boolean;
  /** Entra sign-in handler. Omitted in dev mode. */
  onSignIn?: () => void;
  /** Dev mode renders a plain link into the app instead of the Entra button. */
  devMode?: boolean;
};

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span className="relative flex size-11 items-center justify-center overflow-hidden rounded-xl bg-navy">
        <Image
          src="/cns-hiaa-logo.png"
          alt="CNS HIAA logo"
          width={40}
          height={40}
          className="object-contain"
        />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-lg font-bold tracking-tight text-navy">
          CNS <span className="text-aviation">HIAA</span>
        </span>
        <span className="text-xs font-medium text-muted-foreground">
          Airport KPI Dashboard
        </span>
      </span>
    </div>
  );
}

function Banner({
  message,
  kind = "info",
}: {
  message: string;
  kind?: BannerKind;
}) {
  const styles: Record<BannerKind, string> = {
    success: "border-aviation/30 bg-aviation/10 text-navy",
    warning: "border-destructive/30 bg-destructive/10 text-destructive",
    info: "border-navy/15 bg-muted/60 text-muted-foreground",
  };
  const Icon =
    kind === "success" ? CheckCircle2 : kind === "warning" ? ShieldAlert : Info;
  return (
    <div
      className={`mb-5 flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm ${styles[kind]}`}
      role="status"
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span className="text-pretty">{message}</span>
    </div>
  );
}

export default function LoginForm({
  message,
  messageKind,
  error,
  busy,
  onSignIn,
  devMode,
}: LoginFormProps) {
  return (
    <main className="flex min-h-[calc(100svh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-navy/10 bg-card p-8 shadow-sm">
        <Brand />

        <h1 className="mt-8 text-balance text-xl font-bold text-navy">
          Sign in to continue
        </h1>
        <p className="mt-1 mb-6 text-pretty text-sm text-muted-foreground">
          Access to the CNS HIAA KPI dashboard requires an authorized account.
        </p>

        {message ? <Banner message={message} kind={messageKind} /> : null}

        {devMode ? (
          <>
            <div className="rounded-lg border border-navy/15 bg-muted/50 p-4 text-sm text-muted-foreground">
              Microsoft sign-in is disabled in this environment. The app is
              running on the local development identity.
            </div>
            <Link
              href="/"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy px-4 py-3 text-sm font-semibold text-navy-foreground transition-colors hover:bg-navy/90"
            >
              Continue to dashboard
            </Link>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onSignIn}
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy px-4 py-3 text-sm font-semibold text-navy-foreground shadow-sm transition-colors hover:bg-navy/90 disabled:pointer-events-none disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <LogIn className="size-4" aria-hidden="true" />
              )}
              {busy ? "Signing in…" : "Sign in with Microsoft"}
            </button>
            {error ? (
              <p
                role="alert"
                className="mt-3 flex items-start gap-2 text-sm text-destructive"
              >
                <ShieldAlert
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                <span>{error}</span>
              </p>
            ) : null}
            <p className="mt-4 text-pretty text-center text-xs text-muted-foreground">
              You will be redirected to your organization&apos;s Microsoft Entra
              ID sign-in.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
