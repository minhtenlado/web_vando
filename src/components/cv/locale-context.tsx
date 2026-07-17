'use client'

import * as React from "react"

export type Locale = "vi" | "en"

type LocaleCtx = {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (vi: string, en: string) => string
}

const LocaleContext = React.createContext<LocaleCtx>({
  locale: "vi",
  setLocale: () => {},
  t: (vi) => vi,
})

function readStorage(): Locale {
  if (typeof window === "undefined") return "vi"
  const v = localStorage.getItem("cv-locale")
  return v === "en" ? "en" : "vi"
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>("vi")

  React.useEffect(() => {
    setLocaleState(readStorage())
  }, [])

  const setLocale = React.useCallback((l: Locale) => {
    setLocaleState(l)
    localStorage.setItem("cv-locale", l)
  }, [])

  const t = React.useCallback(
    (vi: string, en: string) => (locale === "en" ? en : vi),
    [locale]
  )

  const value = React.useMemo<LocaleCtx>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  )

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  return React.useContext(LocaleContext)
}
