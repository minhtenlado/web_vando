'use client'

import * as React from "react"
import {
  profile as defaultProfile,
  projects as defaultProjects,
  experiences as defaultExperiences,
  type Project,
  type Experience,
} from "@/lib/cv/data"

export type SiteProfile = typeof defaultProfile
export type SiteProject = Project
export type SiteExperience = Experience
export type SitePost = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  published: boolean
  createdAt: string
  updatedAt: string
}

type SiteData = {
  profile: SiteProfile
  projects: SiteProject[]
  experiences: SiteExperience[]
  posts: SitePost[]
}

type Ctx = SiteData & {
  loading: boolean
  /** Re-fetch site data from the server (e.g. after admin edits). */
  refresh: () => Promise<void>
}

const defaultData: SiteData = {
  profile: defaultProfile,
  projects: defaultProjects,
  experiences: defaultExperiences,
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

  const refresh = React.useCallback(async () => {
    try {
      const res = await fetch("/api/site-data", { cache: "no-store" })
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
  }, [])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  const value = React.useMemo<Ctx>(
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
