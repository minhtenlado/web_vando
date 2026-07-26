'use client'

import * as React from "react"
import type { SiteData, SiteProfile, SiteProject, SiteExperience } from "@/lib/cv/site-data-server"
import {
  profile as defaultProfile,
  projects as defaultProjects,
  experiences as defaultExperiences,
} from "@/lib/cv/data"
import { useLocale } from "./locale-context"

type Ctx = SiteData & {
  loading: boolean
  refresh: () => Promise<void>
}

const defaultData: SiteData = {
  profile: defaultProfile as unknown as SiteProfile,
  projects: defaultProjects as unknown as SiteProject[],
  experiences: defaultExperiences as unknown as SiteExperience[],
  posts: [],
}

const SiteDataContext = React.createContext<Ctx>({
  ...defaultData,
  loading: false,
  refresh: async () => {},
})

export function SiteDataProvider({
  children,
  initialData,
}: {
  children: React.ReactNode
  initialData?: SiteData
}) {
  const [data, setData] = React.useState<SiteData>(initialData || defaultData)
  const [loading, setLoading] = React.useState(!initialData)
  const { locale } = useLocale()
  const isFirstRun = React.useRef(true)

  const refresh = React.useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/site-data?locale=${locale}`, { cache: "no-store" })
      if (res.ok) {
        const json = await res.json()
        setData({
          profile: json.profile ?? defaultData.profile,
          projects: json.projects ?? defaultData.projects,
          experiences: json.experiences ?? defaultData.experiences,
          posts: json.posts ?? [],
        })
      }
    } catch {
      // keep existing data
    } finally {
      setLoading(false)
    }
  }, [locale])

  React.useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      if (initialData) return
    }
    refresh()
  }, [locale, refresh, initialData])

  const value = React.useMemo(
    () => ({ ...data, loading, refresh }),
    [data, loading, refresh]
  )

  return (
    <SiteDataContext.Provider value={value}>
      {children}
    </SiteDataContext.Provider>
  )
}

export function useSiteData() {
  return React.useContext(SiteDataContext)
}
