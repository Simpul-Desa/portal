"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--color-surface)",
          "--normal-text": "var(--color-ink)",
          "--normal-border": "var(--color-line)",
          "--border-radius": "8px", /* less rounded instead of var(--radius-card) */
          "--error-bg": "color-mix(in srgb, var(--color-critical) 10%, transparent)",
          "--error-text": "var(--color-ink)",
          "--error-border": "color-mix(in srgb, var(--color-critical) 40%, transparent)",
          "--success-bg": "color-mix(in srgb, var(--color-positive) 10%, transparent)",
          "--success-text": "var(--color-ink)",
          "--success-border": "color-mix(in srgb, var(--color-positive) 40%, transparent)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-surface group-[.toaster]:text-ink group-[.toaster]:border-line group-[.toaster]:shadow-float group-[.toaster]:rounded-md p-4 flex gap-3 items-start",
          title: "text-sm font-semibold",
          description: "group-[.toast]:text-muted text-sm",
          icon: "mt-0.5",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-white group-[.toast]:rounded-md group-[.toast]:px-4 group-[.toast]:py-2 group-[.toast]:text-xs group-[.toast]:font-medium transition-colors hover:group-[.toast]:bg-primary-active",
          cancelButton:
            "group-[.toast]:bg-rail group-[.toast]:text-ink group-[.toast]:rounded-md group-[.toast]:px-4 group-[.toast]:py-2 group-[.toast]:text-xs hover:group-[.toast]:bg-line transition-colors",
          error:
            "group toast group-[.toaster]:bg-critical/10 group-[.toaster]:text-ink group-[.toaster]:border-critical/30 group-[.toaster]:shadow-float group-[.toaster]:rounded-md p-4 flex gap-3 items-start",
          success:
            "group toast group-[.toaster]:bg-positive/10 group-[.toaster]:text-ink group-[.toaster]:border-positive/30 group-[.toaster]:shadow-float group-[.toaster]:rounded-md p-4 flex gap-3 items-start",
          warning:
            "group toast group-[.toaster]:bg-caution/10 group-[.toaster]:text-ink group-[.toaster]:border-caution/40 group-[.toaster]:shadow-float group-[.toaster]:rounded-md p-4 flex gap-3 items-start",
          info:
            "group toast group-[.toaster]:bg-surface group-[.toaster]:text-ink group-[.toaster]:border-line group-[.toaster]:shadow-float group-[.toaster]:rounded-md p-4 flex gap-3 items-start",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
