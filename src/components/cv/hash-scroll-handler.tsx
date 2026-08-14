'use client'

import * as React from "react"

export function HashScrollHandler() {
  React.useEffect(() => {
    const handleHashScroll = () => {
      const hash = window.location.hash
      if (!hash) return

      const targetId = hash.replace("#", "")
      let attempts = 0
      const interval = setInterval(() => {
        const el = document.getElementById(targetId)
        if (el) {
          clearInterval(interval)
          setTimeout(() => {
            // Using nearest inline allows horizontal scrolling to snap exactly to the item
            el.scrollIntoView({ behavior: "smooth", inline: "start", block: "start" })
          }, 100)
        }
        attempts++
        if (attempts > 30) {
          clearInterval(interval)
        }
      }, 100)
    }

    // Scroll on mount / page load
    handleHashScroll()

    // Scroll on hashchange event
    window.addEventListener("hashchange", handleHashScroll)
    return () => window.removeEventListener("hashchange", handleHashScroll)
  }, [])

  return null
}
