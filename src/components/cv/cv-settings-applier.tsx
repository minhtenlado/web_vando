'use client'

import * as React from 'react'
import { useSiteData } from './site-data-context'
import { useTheme } from 'next-themes'

export function CvSettingsApplier() {
  const { settings } = useSiteData()
  const { setTheme } = useTheme()

  React.useEffect(() => {
    if (!settings) return

    if (settings.compactMode) {
      document.body.classList.add('compact-mode')
    } else {
      document.body.classList.remove('compact-mode')
    }

    if (settings.darkMode !== undefined) {
      setTheme(settings.darkMode ? 'dark' : 'light')
    }
  }, [settings, setTheme])

  return null
}
