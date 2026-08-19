'use client'

import * as React from "react"
import { useTheme } from "next-themes"
import { MessageSquare, Github, Sparkles } from "lucide-react"

type PostCommentsProps = {
  slug: string
  title: string
}

export function PostComments({ slug, title }: PostCommentsProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const commentContainerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted || !commentContainerRef.current) return

    // Clear previous iframe if any
    commentContainerRef.current.innerHTML = ""

    const script = document.createElement("script")
    script.src = "https://giscus.app/client.js"
    script.setAttribute("data-repo", "minhtenlado/web_vando")
    script.setAttribute("data-repo-id", "R_kgDONq8Vew") // Default repo
    script.setAttribute("data-category", "Announcements")
    script.setAttribute("data-category-id", "DIC_kwDONq8Ve84CmG0L")
    script.setAttribute("data-mapping", "pathname")
    script.setAttribute("data-strict", "0")
    script.setAttribute("data-reactions-enabled", "1")
    script.setAttribute("data-emit-metadata", "0")
    script.setAttribute("data-input-position", "top")
    script.setAttribute("data-theme", resolvedTheme === "dark" ? "noborder_gray" : "light")
    script.setAttribute("data-lang", "vi")
    script.setAttribute("crossorigin", "anonymous")
    script.async = true

    commentContainerRef.current.appendChild(script)
  }, [mounted, resolvedTheme, slug])

  return (
    <section id="comments" className="mt-12 p-6 sm:p-8 rounded-3xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-[#0e1217]/80 shadow-[0_20px_60px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-colors">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-sans text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              Thảo luận & Bình luận
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Trao đổi kỹ thuật, đóng góp ý kiến hoặc đặt câu hỏi cùng tác giả
            </p>
          </div>
        </div>

        <a
          href="https://github.com/minhtenlado/web_vando/discussions"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted/60 hover:bg-muted border border-border/40 transition-colors"
        >
          <Github className="w-3.5 h-3.5" />
          <span>GitHub Discussions</span>
        </a>
      </div>

      {/* Giscus Container */}
      <div ref={commentContainerRef} className="min-h-[160px] flex items-center justify-center">
        {!mounted && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse py-8">
            <Sparkles className="w-4 h-4 text-primary animate-spin" />
            <span>Đang tải khung thảo luận...</span>
          </div>
        )}
      </div>
    </section>
  )
}
