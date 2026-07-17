'use client'

import * as React from "react"
import { useLocale, type Locale } from "./locale-context"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/* Inline SVG flags — tiny, no external deps */
function VietnamFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 30 20" className={className} aria-hidden>
      <rect width="30" height="20" fill="#DA251D" rx="2" />
      <polygon
        fill="#FFFF00"
        points="15,3.5 16.76,9.04 22.66,9.04 17.95,12.47 19.71,18 15,14.57 10.29,18 12.05,12.47 7.34,9.04 13.24,9.04"
      />
    </svg>
  )
}

function UKFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 30 20" className={className} aria-hidden>
      <rect width="30" height="20" fill="#012169" rx="2" />
      <path d="M0,0 L30,20 M30,0 L0,20" stroke="#FFF" strokeWidth="3" />
      <path d="M0,0 L30,20 M30,0 L0,20" stroke="#C8102E" strokeWidth="1.5" />
      <path d="M15,0 V20 M0,10 H30" stroke="#FFF" strokeWidth="5" />
      <path d="M15,0 V20 M0,10 H30" stroke="#C8102E" strokeWidth="3" />
    </svg>
  )
}

export function LocaleToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale()

  function toggle() {
    setLocale(locale === "vi" ? "en" : "vi")
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={locale === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
      className={cn("h-9 w-9 relative", className)}
    >
      {locale === "vi" ? (
        <VietnamFlag className="h-5 w-7 rounded-sm" />
      ) : (
        <UKFlag className="h-5 w-7 rounded-sm" />
      )}
    </Button>
  )
}

/* Admin variant — shows label next to flag */
export function AdminLocaleToggle({
  locale,
  onChange,
  className,
}: {
  locale: Locale
  onChange: (l: Locale) => void
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-1 rounded-lg border border-border p-0.5", className)}>
      <button
        onClick={() => onChange("vi")}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
          locale === "vi"
            ? "bg-primary/15 text-primary border border-primary/30"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <VietnamFlag className="h-3.5 w-5 rounded-sm" />
        VI
      </button>
      <button
        onClick={() => onChange("en")}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
          locale === "en"
            ? "bg-primary/15 text-primary border border-primary/30"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <UKFlag className="h-3.5 w-5 rounded-sm" />
        EN
      </button>
    </div>
  )
}
