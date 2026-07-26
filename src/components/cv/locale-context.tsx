'use client'

import * as React from "react"

export type Locale = "vi" | "en"

type LocaleContextType = {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (viText: string, enText: string) => string
}

const LocaleContext = React.createContext<LocaleContextType>({
  locale: "vi",
  setLocale: () => {},
  t: (vi) => vi,
})

export function LocaleProvider({
  children,
  initialLocale = "vi"
}: {
  children: React.ReactNode
  initialLocale?: string
}) {
  const [locale, setLocaleState] = React.useState<Locale>(initialLocale === "en" ? "en" : "vi")

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("cv-locale") as Locale
      if (stored && (stored === "vi" || stored === "en") && stored !== locale) {
        setLocaleState(stored)
        document.cookie = `cv-locale=${stored}; path=/; max-age=31536000; SameSite=Lax`
      }
    } catch {}
  }, [])

  const setLocale = React.useCallback((l: Locale) => {
    setLocaleState(l)
    try {
      localStorage.setItem("cv-locale", l)
      document.cookie = `cv-locale=${l}; path=/; max-age=31536000; SameSite=Lax`
    } catch {}
  }, [])

  const t = React.useCallback(
    (viText: string, enText: string) => (locale === "en" ? enText : viText),
    [locale]
  )

  const value = React.useMemo(
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
