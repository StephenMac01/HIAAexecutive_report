import * as React from "react"
import { cn } from "@/lib/utils"

const variants = {
  default: "border-transparent bg-primary text-primary-foreground",
  secondary: "border-transparent bg-secondary text-secondary-foreground",
  destructive: "border-transparent bg-destructive text-white",
  outline: "text-foreground",
  success: "border-transparent bg-success text-white",
  warning: "border-transparent bg-warning text-black",
} as const

function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & { variant?: keyof typeof variants }) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap",
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}

export { Badge }
