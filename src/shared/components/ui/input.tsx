import * as React from "react"
import { cn } from "@/lib/utils"
import { FOCUS_RING } from "@/shared/components/focus-ring"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 sm:h-11 w-full min-w-0 rounded-md border border-line bg-transparent px-3 py-2 text-base sm:text-sm shadow-xs transition-all outline-none selection:bg-primary/20 placeholder:text-muted disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        FOCUS_RING,
        className
      )}
      {...props}
    />
  )
}

export { Input }
