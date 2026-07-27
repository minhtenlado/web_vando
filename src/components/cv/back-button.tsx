'use client'

import { ArrowLeft } from "lucide-react"

export function BackButton() {
  const handleBack = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    window.location.href = "/#posts"
  }

  return (
    <a 
      href="/#posts" 
      onClick={handleBack}
      className="text-muted-foreground hover:text-foreground transition-colors shrink-0 flex items-center gap-2 group" 
      title="Trở về danh sách bài viết"
    >
      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
      <span className="text-sm font-medium hidden sm:block">Trở về</span>
    </a>
  )
}
