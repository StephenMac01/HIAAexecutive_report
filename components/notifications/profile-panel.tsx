"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { CurrentUser } from "@/lib/notifications/types"

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  manager: "Manager",
  viewer: "Viewer",
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  admin: "Full access, including subscription assignment and audit review.",
  manager: "Can manage own subscriptions and acknowledge alerts for assigned KPIs.",
  viewer: "Can view dashboards and manage own alert subscriptions.",
}

export function ProfilePanel({ user }: { user: CurrentUser }) {
  const isEntra = user.authSource === "entra"
  const initials = user.displayName
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy text-xl font-semibold text-primary-foreground">
            {initials}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-foreground">{user.displayName}</h2>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            <Badge variant="secondary" className="mt-1">
              {ROLE_LABELS[user.role] ?? user.role}
            </Badge>
          </div>
        </div>

        <dl className="mt-6 divide-y divide-border border-t border-border text-sm">
          <div className="flex justify-between py-3">
            <dt className="text-muted-foreground">Role</dt>
            <dd className="font-medium text-foreground">{ROLE_LABELS[user.role] ?? user.role}</dd>
          </div>
          <div className="py-3">
            <dt className="text-muted-foreground">Permissions</dt>
            <dd className="mt-1 text-foreground">{ROLE_DESCRIPTIONS[user.role] ?? "Standard access."}</dd>
          </div>
          <div className="flex items-center justify-between py-3">
            <dt className="text-muted-foreground">Sign-in method</dt>
            <dd className="font-medium text-foreground">
              {isEntra ? "Microsoft Entra ID" : "Dev identity (local)"}
            </dd>
          </div>
          {isEntra && user.appRoles && user.appRoles.length > 0 ? (
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-muted-foreground">Directory app roles</dt>
              <dd className="flex flex-wrap justify-end gap-1">
                {user.appRoles.map((r) => (
                  <Badge key={r} variant="outline" className="font-normal">
                    {r}
                  </Badge>
                ))}
              </dd>
            </div>
          ) : null}
          <div className="flex justify-between py-3">
            <dt className="text-muted-foreground">{isEntra ? "Entra object ID" : "Directory ID"}</dt>
            <dd className="font-mono text-xs text-foreground">{user.id}</dd>
          </div>
        </dl>

        <p className="mt-4 rounded-md bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
          {isEntra
            ? "You are signed in with Microsoft Entra ID via Azure App Service authentication. Your role is assigned through Entra App Roles and syncs automatically on each sign-in."
            : "Running with the local dev identity because Microsoft Entra sign-in is not in front of the app here. On Azure App Service with Easy Auth enabled, this profile populates automatically from your directory account and App Role assignment."}
        </p>
      </Card>
    </div>
  )
}
