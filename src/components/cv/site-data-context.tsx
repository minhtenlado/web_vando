'use client'

import * as React from "react"
import type { SiteData, SiteProfile, SiteProject, SiteExperience, SitePost } from "@/lib/cv/site-data-server"
import {
  profile as defaultProfile,
  projects as defaultProjects,
  experiences as defaultExperiences,
  type Project,
  type Experience,
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
  loading: true,
  refresh: async () => {},
})

export function SiteDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = React.useState<SiteData>(defaultData)
  const [loading, setLoading] = React.useState(true)
  const { locale } = useLocale()

  const refresh = React.useCallback(async () => {
    try {
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
      // keep defaults
    } finally {
      setLoading(false)
    }
  }, [locale])

  React.useEffect(() => {
    refresh()
  }, [refresh])

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
