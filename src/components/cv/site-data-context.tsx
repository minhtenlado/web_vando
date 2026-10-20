'use client';

import { publicSettingsDefaults } from '@/lib/cv/public-settings';
import type { SiteData } from '@/lib/cv/site-data-server';
import * as React from 'react';
import { useLocale } from './locale-context';

type Context = SiteData & { loading: boolean; requestFailed: boolean; refresh: () => Promise<void> };
const emptyData: SiteData = {
  profile: {
    name: '', role: '', tagline: '', location: '', email: '', phone: '', website: '', github: '', linkedin: '',
    summary: '', avatar: '', principles: [], stats: [], nowText: '', skillGroups: [], socials: [],
    aboutSubtitle: '', skillsSubtitle: '', experienceSubtitle: '', animatedRoles: [], techBadges: [],
    educations: [], certifications: [], languages: [], available: false,
  },
  projects: [], experiences: [], posts: [], settings: { ...publicSettingsDefaults }, errors: {},
};
const SiteDataContext = React.createContext<Context>({
  ...emptyData, loading: false, requestFailed: false, refresh: async () => {},
});

export function SiteDataProvider({ children, initialData }: { children: React.ReactNode; initialData?: SiteData }) {
  const [data, setData] = React.useState(initialData || emptyData);
  const [loading, setLoading] = React.useState(!initialData);
  const [requestFailed, setRequestFailed] = React.useState(false);
  const { locale } = useLocale();
  const firstRun = React.useRef(true);
  const latestRequest = React.useRef(0);

  const refresh = React.useCallback(async () => {
    const requestId = ++latestRequest.current;
    setLoading(true);
    try {
      const response = await fetch('/api/site-data?locale=' + locale, { cache: 'no-store' });
      const next: SiteData = await response.json();
      if (!Array.isArray(next.projects) || !Array.isArray(next.posts) || (!response.ok && !next.errors)) throw new Error('Content request failed');
      if (requestId !== latestRequest.current) return;
      setData((previous) => ({
        ...next,
        projects: next.errors?.projects ? previous.projects : next.projects,
        posts: next.errors?.posts ? previous.posts : next.posts,
      }));
      setRequestFailed(false);
    } catch {
      if (requestId === latestRequest.current) setRequestFailed(true);
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }, [locale]);

  React.useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      if (initialData) return;
    }
    void refresh();
  }, [locale, refresh, initialData]);

  const value = React.useMemo(() => ({ ...data, loading, requestFailed, refresh }), [data, loading, requestFailed, refresh]);
  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>;
}

export function useSiteData() { return React.useContext(SiteDataContext); }
