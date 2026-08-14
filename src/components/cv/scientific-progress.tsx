'use client'

import * as React from "react"

export function ScientificProgress() {
  const [progress, setProgress] = React.useState(0)

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const height = document.documentElement.scrollHeight - window.innerHeight
      const percentage = height > 0 ? (scrollTop / height) * 100 : 0
      setProgress(percentage)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div 
      className="fixed top-0 left-0 h-[2px] z-[9999] transition-all duration-75 ease-linear bg-gradient-to-r from-[#7c8cff] via-[#8d6bff] to-[#52d7ff] shadow-[0_0_14px_rgba(124,140,255,0.7)]"
      style={{ width: `${progress}%` }}
    />
  )
}
