'use client'

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export function BackButton() {
  const router = useRouter()

  const handleBack = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    
    // 1. Chuyển hướng về trang chủ
    router.push("/")
    
    // 2. Liên tục kiểm tra xem phần tử #posts đã render chưa để scroll tới
    let attempts = 0
    const interval = setInterval(() => {
      const el = document.getElementById("posts")
      if (el) {
        clearInterval(interval)
        // Khi trang đã load xong layout, thay đổi URL hash và cuộn xuống
        window.history.replaceState(null, '', '/#posts')
        el.scrollIntoView({ behavior: "smooth" })
      }
      attempts++
      if (attempts > 20) clearInterval(interval) // Dừng lại sau 2 giây nếu không tìm thấy
    }, 100)
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
