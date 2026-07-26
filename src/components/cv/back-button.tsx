'use client'

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export function BackButton() {
  const router = useRouter()

  const handleBack = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    // Nếu có lịch sử trang trước đó (tức là đi từ trang chủ vào), thì quay lại để giữ nguyên vị trí scroll
    if (window.history.length > 2) {
      router.back()
    } else {
      // Nếu mở tab mới, thì cho về trang chủ có kèm hash
      router.push("/#posts")
      // Force a small timeout then scroll into view just in case Next.js router doesn't scroll
      setTimeout(() => {
        const el = document.getElementById("posts")
        if (el) el.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }
  }

  return (
    <a 
      href="/#posts" 
      onClick={handleBack}
      className="text-muted-foreground hover:text-foreground transition-colors shrink-0 flex items-center gap-2 group" 
      title="Trở về"
    >
      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
      <span className="text-sm font-medium hidden sm:block">Trở về</span>
    </a>
  )
}
