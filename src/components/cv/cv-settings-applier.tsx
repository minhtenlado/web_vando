'use client'

import * as React from 'react'
import { useSiteData } from './site-data-context'
export function CvSettingsApplier() {
  const { settings } = useSiteData()

  React.useEffect(() => {
    if (!settings) return

    if (settings.compactMode) {
      document.body.classList.add('compact-mode')
    } else {
      document.body.classList.remove('compact-mode')
    }
  }, [settings])

  return null
}
