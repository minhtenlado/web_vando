'use client'

import * as React from "react"
import { sanitizePostHtml } from "@/lib/validation"
import { Heart, MessageSquare, Share2, Eye, Clock, Calendar, Check, ArrowUp, Sparkles } from "lucide-react"
import { PostEngagementBar } from "./post-engagement-bar"
import { PostComments } from "./post-comments"

type PostReaderProps = {
  slug: string
  title: string
  pubDate: string
  readingTime: number
  contentHtml: string
  coverImage?: string | null
  pdfUrl?: string | null
  authorName?: string
  authorRole?: string
  category?: string
  excerpt?: string | null
  views?: number
  likes?: number
  children?: React.ReactNode
}

export function PostReader({ 
  slug, 
  title, 
  pubDate, 
  readingTime, 
  contentHtml, 
  coverImage,
  pdfUrl, 
  authorName = "Phan Huỳnh Văn Đô", 
  authorRole = "Embedded Software & AIoT Engineer", 
  category, 
  excerpt, 
  views = 0, 
  likes = 0, 
  children 
}: PostReaderProps) {
  const [fontSize, setFontSize] = React.useState(18)
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [copiedLink, setCopiedLink] = React.useState(false)
  const articleRef = React.useRef<HTMLElement>(null)
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  const [readingMode, setReadingMode] = React.useState(false)

  const [currentLikes, setCurrentLikes] = React.useState(likes)
  const [currentViews, setCurrentViews] = React.useState(views)
  const [hasLiked, setHasLiked] = React.useState(false)
  const [commentsCount, setCommentsCount] = React.useState(0)
  const [isCommentsOpen, setIsCommentsOpen] = React.useState(false)

  React.useEffect(() => {
    setHasLiked(localStorage.getItem(`like_${slug}`) === "true")
    
    // Auto-open comments if URL hash is #comments
    if (typeof window !== "undefined" && window.location.hash === "#comments") {
      setIsCommentsOpen(true)
    }

    // Fetch comments count
    fetch(`/api/posts/${slug}/comments`)
      .then((res) => res.json())
      .then((data) => {
        if (data.comments) setCommentsCount(data.comments.length)
      })
      .catch(() => {})

    // Increment view once per session per post
    if (!sessionStorage.getItem(`viewed_${slug}`)) {
      sessionStorage.setItem(`viewed_${slug}`, "true")
      fetch(`/api/posts/${slug}/stats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "view" }),
      })
      .then(res => res.json())
      .then(data => {
        if (data.views) setCurrentViews(data.views)
      })
      .catch(console.error)
    }
  }, [slug])

  const handleToggleComments = () => {
    const next = !isCommentsOpen
    setIsCommentsOpen(next)
    if (next) {
      setTimeout(() => {
        const el = document.getElementById("comments-section")
        if (el) {
          el.scrollIntoView({ behavior: "smooth" })
          const textarea = el.querySelector("textarea")
          if (textarea) textarea.focus()
        }
      }, 150)
    }
  }

  const handleLike = async () => {
    const currentState = hasLiked
    setHasLiked(!currentState)
    setCurrentLikes(prev => currentState ? Math.max(0, prev - 1) : prev + 1)
    localStorage.setItem(`like_${slug}`, (!currentState).toString())

    try {
      await fetch(`/api/posts/${slug}/stats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: currentState ? "unlike" : "like" }),
      })
    } catch (err) {
      console.error(err)
    }
  }

  const scrollToComments = () => {
    const commentsEl = document.getElementById("comments")
    if (commentsEl) {
      commentsEl.scrollIntoView({ behavior: "smooth" })
      const textarea = commentsEl.querySelector("textarea")
      if (textarea) setTimeout(() => textarea.focus(), 400)
    }
  }

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    }
  }

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }
  
  React.useEffect(() => {
    // Process code blocks for syntax highlight and copy button
    if (articleRef.current) {
      const preElements = articleRef.current.querySelectorAll('pre')
      preElements.forEach(pre => {
        if (pre.closest('.code-block-wrapper')) return
        
        const wrapper = document.createElement('div')
        wrapper.className = 'code-block-wrapper relative my-6 rounded-xl overflow-hidden border border-border/40 dark:border-zinc-800 bg-[#1e1e2e] shadow-lg'
        
        const header = document.createElement('div')
        header.className = 'flex items-center justify-between px-4 py-2 bg-black/40 border-b border-white/5 text-[11px] font-mono text-zinc-400'
        
        header.innerHTML = `
          <span class="flex items-center gap-1.5 font-semibold text-zinc-300">
            <span class="inline-block w-2 h-2 rounded-full bg-emerald-400"></span> Code Block
          </span>
          <button class="copy-code-btn flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-zinc-200 transition-colors cursor-pointer text-[11px]" title="Sao chép">
            <span>Copy</span>
          </button>
        `
        
        const copyBtn = header.querySelector('.copy-code-btn')
        if (copyBtn) {
          copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(pre.textContent || '')
            copyBtn.innerHTML = '<span>Đã sao chép!</span>'
            setTimeout(() => { if (copyBtn) copyBtn.innerHTML = '<span>Copy</span>' }, 2000)
          })
        }
        
        pre.parentNode?.insertBefore(wrapper, pre)
        wrapper.appendChild(header)
        wrapper.appendChild(pre)
      })
    }

    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css"
    document.head.appendChild(link)

    const highlightBlocks = () => {
      if ((window as any).hljs) {
        document.querySelectorAll('.ql-editor-display pre, .code-block-wrapper pre').forEach((block) => {
          (window as any).hljs.highlightElement(block);
        });
      }
    }

    let scriptElement: HTMLScriptElement | null = null;
    if (!document.querySelector('script[src*="highlight.js"]')) {
      const script = document.createElement("script")
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"
      script.onload = highlightBlocks
      document.body.appendChild(script)
      scriptElement = script;
    } else if ((window as any).hljs) {
      highlightBlocks();
    }

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link)
      if (scriptElement && document.body.contains(scriptElement)) document.body.removeChild(scriptElement)
    }
  }, [contentHtml])

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  React.useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase()
      if (articleRef.current) {
        const paragraphs = articleRef.current.querySelectorAll('p, h1, h2, h3, li')
        for (const p of Array.from(paragraphs)) {
          if (p.textContent?.toLowerCase().includes(query)) {
            p.scrollIntoView({ behavior: 'smooth' })
            break
          }
        }
      }
      setSearchOpen(false)
    }
  }

  React.useEffect(() => {
    const layout = document.querySelector('main') as HTMLElement
    const leftAside = layout?.querySelector('aside:first-child') as HTMLElement
    const rightAside = layout?.querySelector('aside:last-child') as HTMLElement
    
    if (readingMode && layout) {
      if (leftAside) leftAside.style.display = 'none'
      if (rightAside) rightAside.style.display = 'none'
      layout.style.gridTemplateColumns = 'minmax(0, 1200px)'
      layout.style.justifyContent = 'center'
    } else if (layout) {
      if (leftAside) leftAside.style.display = ''
      if (rightAside) rightAside.style.display = ''
      layout.style.gridTemplateColumns = ''
      layout.style.justifyContent = ''
    }
  }, [readingMode])

  return (
    <>
      <article ref={articleRef} className="relative min-w-0 px-6 py-10 sm:px-12 md:px-16 lg:px-20 sm:py-14 pb-[100px] border border-black/5 dark:border-white/5 rounded-[24px] bg-white dark:bg-gradient-to-b dark:from-[#101419]/96 dark:to-[#0a0c10]/98 shadow-[0_30px_90px_rgba(0,0,0,0.08)] dark:shadow-[0_30px_100px_rgba(0,0,0,0.25)] overflow-hidden">
        
        <div className="absolute top-[-180px] left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[radial-gradient(circle,rgba(107,123,255,0.09),transparent_68%)] pointer-events-none hidden dark:block" />

        {/* Post Category & Meta Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          {category && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="w-3 h-3" /> {category}
            </span>
          )}

          <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> {currentViews} lượt xem
            </span>
            <span className="inline-flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500" /> {currentLikes} thích
            </span>
          </div>
        </div>

        {/* Title */}
        <header className="relative z-10 pb-8 border-b border-black/5 dark:border-white/10">
          <h1 className="m-0 max-w-none font-sans text-[clamp(30px,3.8vw,50px)] font-extrabold leading-[1.15] tracking-[-0.035em] text-gray-900 dark:text-[#f4f5f7]">
            {title}
          </h1>

          {/* Author & Publication Info */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-5 border-t border-border/20 text-[13px]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-emerald-400 p-0.5 flex items-center justify-center shadow-md">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center font-bold text-xs text-primary">
                  {authorName.charAt(0)}
                </div>
              </div>
              <div>
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  {authorName}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {authorRole}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> {pubDate}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> ~{readingTime} phút đọc
              </div>
            </div>
          </div>
        </header>

        {/* Optional Cover Image */}
        {coverImage && coverImage.trim() !== "" && (
          <div className="mt-8 mb-6 rounded-2xl overflow-hidden border border-border/30 shadow-xl max-h-[500px] relative group bg-muted">
            <img 
              src={coverImage} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 pointer-events-none" />
          </div>
        )}

        {/* Content Section */}
        <div 
          className="pt-8 font-serif text-[#454a53] dark:text-[#c8ccd4] leading-[1.85]" 
          style={{ fontSize: `${fontSize}px` }}
        >
          {excerpt && (
            <section id="abstract" className="relative mb-[45px] p-6 sm:p-7 border border-primary/20 rounded-[18px] bg-primary/5 dark:bg-primary/5">
              <div className="absolute -top-[9px] left-5 px-2 bg-white dark:bg-[#101419] text-primary font-sans text-[9px] font-extrabold tracking-[0.16em]">
                TÓM TẮT BÀI VIẾT (ABSTRACT)
              </div>
              <div className="font-serif italic text-foreground/90 leading-relaxed">
                {excerpt}
              </div>
            </section>
          )}

          {pdfUrl && (
            <div className="mb-10 w-full flex flex-col items-center">
              <div className="w-full h-[500px] sm:h-[700px] lg:h-[900px] rounded-xl overflow-hidden border border-black/10 dark:border-white/10 shadow-inner bg-zinc-100 dark:bg-zinc-900/50 mb-6">
                <iframe
                  src={`${pdfUrl}#toolbar=0`}
                  width="100%"
                  height="100%"
                  className="w-full h-full border-0"
                  title="PDF Preview"
                />
              </div>
            </div>
          )}

          <div 
            className="prose dark:prose-invert text-[#222428] dark:text-[#c9d1d9] max-w-none prose-p:my-[22px] prose-p:leading-[1.85] prose-headings:font-sans prose-headings:tracking-[-0.025em] prose-h2:mt-10 prose-h2:mb-5 prose-h2:text-[25px] prose-h2:leading-[1.25] prose-h2:text-[#16191e] dark:prose-h2:text-[#f3f4f6] prose-h3:mt-[38px] prose-h3:mb-3 prose-h3:text-[17px] prose-h3:text-[#16191e] dark:prose-h3:text-[#e4e6eb] prose-strong:text-gray-900 dark:prose-strong:text-[#f2f3f5] prose-strong:font-bold prose-a:text-primary dark:prose-a:text-[#9ca8ff] prose-a:no-underline prose-a:border-b prose-a:border-dashed prose-a:border-primary/40 dark:prose-a:border-[#9ca8ff]/45 hover:prose-a:text-primary/80 dark:hover:prose-a:text-[#c5cbff] hover:prose-a:border-primary/80 dark:hover:prose-a:border-[#c5cbff] prose-img:rounded-[10px] prose-img:mx-auto prose-pre:bg-zinc-950 prose-pre:text-zinc-50 prose-pre:border prose-pre:border-zinc-800 prose-pre:p-4 prose-pre:rounded-xl prose-code:text-pink-500 ql-editor-display"
            dangerouslySetInnerHTML={{ __html: sanitizePostHtml(contentHtml) }}
          />

          {children}
        </div>

        {/* Interactive Social Engagement Bar (Facebook Style) */}
        <PostEngagementBar
          slug={slug}
          title={title}
          likes={currentLikes}
          commentsCount={commentsCount}
          isCommentsOpen={isCommentsOpen}
          onToggleComments={handleToggleComments}
        />

        {/* Collapsible Comments Section (Only appears when clicked) */}
        {isCommentsOpen && (
          <div id="comments-section" className="mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <PostComments
              slug={slug}
              title={title}
              onCommentCountChange={setCommentsCount}
            />
          </div>
        )}

      </article>

      {/* Floating Reader Controls (Bottom Toolbar) */}
      <div className="fixed z-[600] left-1/2 bottom-[25px] -translate-x-1/2 flex items-center gap-1.5 p-1.5 border border-black/10 dark:border-white/10 rounded-2xl bg-white/90 dark:bg-[#101217]/90 shadow-[0_15px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_15px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <button 
          onClick={() => setFontSize(Math.max(15, fontSize - 1))}
          className="w-8 h-8 grid place-items-center border-0 rounded-xl bg-transparent text-muted-foreground cursor-pointer transition-all hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10"
          title="Giảm cỡ chữ"
        >
          A−
        </button>
        <div className="min-w-[36px] text-center text-muted-foreground text-xs font-mono">
          {fontSize}
        </div>
        <button 
          onClick={() => setFontSize(Math.min(26, fontSize + 1))}
          className="w-8 h-8 grid place-items-center border-0 rounded-xl bg-transparent text-muted-foreground cursor-pointer transition-all hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10"
          title="Tăng cỡ chữ"
        >
          A+
        </button>
        <div className="w-px h-4 bg-border/60 mx-1" />
        <button 
          onClick={() => setReadingMode(!readingMode)}
          className={`w-8 h-8 grid place-items-center border-0 rounded-xl cursor-pointer transition-all ${readingMode ? 'bg-primary/20 text-primary font-bold' : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10'}`}
          title="Chế độ tập trung đọc"
        >
          ◐
        </button>
      </div>

      {searchOpen && (
        <div className="fixed z-[2000] inset-0 flex items-start justify-center pt-[15vh] bg-black/20 dark:bg-black/55 backdrop-blur-[10px]" onClick={(e) => { if(e.target === e.currentTarget) setSearchOpen(false) }}>
          <div className="w-[min(600px,calc(100%-32px))] overflow-hidden border border-black/10 dark:border-white/10 rounded-[18px] bg-white dark:bg-[#111419] shadow-[0_40px_100px_rgba(0,0,0,0.15)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.55)] animate-in fade-in zoom-in-95 duration-200">
            <input 
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full px-[22px] py-[20px] border-0 outline-none bg-transparent text-gray-900 dark:text-white text-[16px] font-sans"
              placeholder="Tìm trong bài viết... (Nhấn Enter để tìm)"
            />
          </div>
        </div>
      )}
    </>
  )
}

