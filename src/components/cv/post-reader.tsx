'use client'

import * as React from "react"
import { sanitizePostHtml } from "@/lib/validation"

type PostReaderProps = {
  slug: string
  title: string
  pubDate: string
  readingTime: number
  contentHtml: string
  pdfUrl?: string | null
  authorName?: string
  authorRole?: string
  category?: string
  excerpt?: string | null
  views?: number
  likes?: number
  bookmarks?: number
  children?: React.ReactNode
}

export function PostReader({ slug, title, pubDate, readingTime, contentHtml, pdfUrl, authorName, authorRole, category, excerpt, views = 0, likes = 0, bookmarks = 0, children }: PostReaderProps) {
  const [fontSize, setFontSize] = React.useState(18)
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const articleRef = React.useRef<HTMLElement>(null)
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  const [readingMode, setReadingMode] = React.useState(false)

  const [currentLikes, setCurrentLikes] = React.useState(likes)
  const [currentBookmarks, setCurrentBookmarks] = React.useState(bookmarks)
  const [currentViews, setCurrentViews] = React.useState(views)
  const [hasLiked, setHasLiked] = React.useState(false)
  const [hasBookmarked, setHasBookmarked] = React.useState(false)

  React.useEffect(() => {
    setHasLiked(localStorage.getItem(`like_${slug}`) === "true")
    setHasBookmarked(localStorage.getItem(`bookmark_${slug}`) === "true")
    
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

  const handleInteract = async (type: "like" | "bookmark") => {
    const isLike = type === "like"
    const currentState = isLike ? hasLiked : hasBookmarked
    const action = isLike ? (currentState ? "unlike" : "like") : (currentState ? "unbookmark" : "bookmark")

    if (isLike) {
      setHasLiked(!currentState)
      setCurrentLikes(prev => currentState ? Math.max(0, prev - 1) : prev + 1)
      localStorage.setItem(`like_${slug}`, (!currentState).toString())
    } else {
      setHasBookmarked(!currentState)
      setCurrentBookmarks(prev => currentState ? Math.max(0, prev - 1) : prev + 1)
      localStorage.setItem(`bookmark_${slug}`, (!currentState).toString())
    }

    try {
      await fetch(`/api/posts/${slug}/stats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
    } catch (err) {
      console.error(err)
    }
  }
  
  React.useEffect(() => {
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css"
    document.head.appendChild(link)

    const highlightBlocks = () => {
      if ((window as any).hljs) {
        document.querySelectorAll('.ql-editor-display pre').forEach((block) => {
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
      layout.style.gridTemplateColumns = 'minmax(600px, 1200px)'
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

        <header className="relative z-10 pb-8 border-b border-black/5 dark:border-white/10">
          <h1 className="m-0 max-w-none font-sans text-[clamp(34px,4vw,54px)] font-extrabold leading-[1.1] tracking-[-0.035em] text-gray-900 dark:text-[#f4f5f7]">
            {title}
          </h1>

          <div className="flex flex-wrap gap-5 mt-6 text-[#8c94a2] text-[13px] font-sans">
            <div className="flex items-center gap-1.5 text-gray-600 dark:text-[#8c94a2]">
              ◷ {pubDate}
            </div>
            <div className="flex items-center gap-1.5 text-gray-600 dark:text-[#8c94a2]">
              ◴ {readingTime} phút đọc
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-5 font-sans">
            <span className="px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-gray-700 dark:text-[#c8ccd5] text-[12px]">
              {authorName}
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-gray-700 dark:text-[#c8ccd5] text-[12px]">
              {authorRole}
            </span>
          </div>
        </header>

        <div 
          className="pt-10 font-serif text-[#454a53] dark:text-[#c8ccd4] leading-[1.85]" 
          style={{ fontSize: `${fontSize}px` }}
        >
          {excerpt && (
            <section id="abstract" className="relative mb-[60px] p-7 border border-[#828cff]/15 rounded-[18px] bg-gradient-to-br from-[#7c8cff]/5 to-transparent dark:from-[rgba(124,140,255,0.065)] dark:to-[rgba(255,255,255,0.02)]">
              <div className="absolute -top-[9px] left-5 px-2 bg-white dark:bg-[#101419] text-[#8995ff] font-sans text-[9px] font-extrabold tracking-[0.16em]">
                ABSTRACT
              </div>
              <div className="font-serif">
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

      </article>

      <div className="fixed z-[600] left-1/2 bottom-[25px] -translate-x-1/2 flex items-center gap-1 p-1.5 border border-black/10 dark:border-white/10 rounded-[15px] bg-white/80 dark:bg-[#101217]/80 shadow-[0_15px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_15px_60px_rgba(0,0,0,0.45)] backdrop-blur-[24px]">
        <button 
          onClick={() => setFontSize(Math.max(15, fontSize - 1))}
          className="w-[34px] h-[34px] grid place-items-center border-0 rounded-[9px] bg-transparent text-gray-500 dark:text-[#8e96a4] cursor-pointer transition-all hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10"
          title="Giảm font"
        >
          A−
        </button>
        <div className="min-w-[40px] text-center text-gray-500 dark:text-[#8e96a4] text-[11px] font-sans">
          {fontSize}
        </div>
        <button 
          onClick={() => setFontSize(Math.min(26, fontSize + 1))}
          className="w-[34px] h-[34px] grid place-items-center border-0 rounded-[9px] bg-transparent text-gray-500 dark:text-[#8e96a4] cursor-pointer transition-all hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10"
          title="Tăng font"
        >
          A+
        </button>
        <button 
          onClick={() => setReadingMode(!readingMode)}
          className={`w-[34px] h-[34px] grid place-items-center border-0 rounded-[9px] cursor-pointer transition-all ${readingMode ? 'bg-black/10 dark:bg-white/20 text-gray-900 dark:text-white' : 'bg-transparent text-gray-500 dark:text-[#8e96a4] hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'}`}
          title="Reading mode"
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
