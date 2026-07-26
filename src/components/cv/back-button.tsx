'use client'

import { ArrowLeft } from "lucide-react"

export function BackButton() {
  const handleBack = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    // Sử dụng điều hướng cứng (hard navigation) để đảm bảo trình duyệt 
    // chắc chắn sẽ tự động cuộn (scroll) tới đúng phần #posts 
    // (Bỏ qua các lỗi của Next.js router khi cuộn tới hash từ trang khác)
    window.location.href = "/#posts"
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
