import type * as React from "react"
import { cn } from "@/lib/utils"

type BadgeProps = React.ComponentProps<"span"> & {
  variant?: "default" | "accent" | "destructive" | "success" | "outline" | "muted"
}

const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-primary text-primary-foreground",
  accent: "bg-accent text-accent-foreground",
  destructive: "bg-destructive text-white",
  success: "bg-emerald-600 text-white",
  muted: "bg-muted text-muted-foreground",
  outline: "border text-foreground",
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold",
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
