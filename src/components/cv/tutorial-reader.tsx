'use client'

import * as React from "react"
import { sanitizePostHtml } from "@/lib/validation"
import './tutorial-reader.css'

type TutorialReaderProps = {
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

export function TutorialReader({ slug, title, pubDate, readingTime, contentHtml, pdfUrl, authorName, authorRole, category, excerpt, views = 0, likes = 0, bookmarks = 0, children }: TutorialReaderProps) {
  const [fontSize, setFontSize] = React.useState(16)
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
    // 1. Process blockquotes to admonitions
    if (articleRef.current) {
      const blockquotes = articleRef.current.querySelectorAll('blockquote');
      blockquotes.forEach(bq => {
        const text = bq.textContent || '';
        let type = '';
        if (text.includes('[!NOTE]')) type = 'note';
        else if (text.includes('[!TIP]')) type = 'tip';
        else if (text.includes('[!CAUTION]')) type = 'caution';
        else if (text.includes('[!DANGER]')) type = 'danger';

        if (type) {
          const div = document.createElement('div');
          div.className = `admonition admonition-${type}`;
          
          let html = bq.innerHTML;
          html = html.replace(/\[!(NOTE|TIP|CAUTION|DANGER)\]/, '');
          
          let icon = '';
          if (type === 'note') icon = 'ℹ️';
          if (type === 'tip') icon = '💡';
          if (type === 'caution') icon = '⚠️';
          if (type === 'danger') icon = '🚨';

          div.innerHTML = `
            <div class="admonition-title">${icon} ${type}</div>
            <div class="admonition-content">${html}</div>
          `;
          bq.replaceWith(div);
        }
      });

      // 2. Process steps timeline
      const olElements = articleRef.current.querySelectorAll('ol.steps, ol[data-steps]');
      olElements.forEach(ol => {
        ol.classList.add('tutorial-steps');
      });

      // 3. Process headings for anchors
      const headings = articleRef.current.querySelectorAll('h2, h3');
      headings.forEach(h => {
        if (!h.id) {
          h.id = (h.textContent || '').toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        }
        if (!h.querySelector('.heading-anchor')) {
          const anchor = document.createElement('a');
          anchor.href = `#${h.id}`;
          anchor.className = 'heading-anchor';
          anchor.innerHTML = '#';
          h.appendChild(anchor);
        }
      });

      // 4. Wrap code blocks
      const preElements = articleRef.current.querySelectorAll('pre');
      preElements.forEach(pre => {
        if (pre.closest('.tutorial-code-block')) return;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'tutorial-code-block';
        
        const header = document.createElement('div');
        header.className = 'tutorial-code-header';
        
        header.innerHTML = `
          <span class="tutorial-code-lang">Code</span>
          <button class="tutorial-code-copy" title="Copy code">Copy</button>
        `;
        
        const copyBtn = header.querySelector('button');
        if (copyBtn) {
          copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(pre.textContent || '');
            copyBtn.textContent = 'Copied!';
            setTimeout(() => { if (copyBtn) copyBtn.textContent = 'Copy'; }, 2000);
          });
        }
        
        pre.parentNode?.insertBefore(wrapper, pre);
        wrapper.appendChild(header);
        wrapper.appendChild(pre);
      });
    }

    // 5. Highlight JS setup
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"
    document.head.appendChild(link)

    const highlightBlocks = () => {
      if ((window as any).hljs) {
        document.querySelectorAll('.tutorial-code-block pre').forEach((block) => {
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
      <article ref={articleRef} className="relative min-w-0 px-6 py-10 sm:px-12 md:px-16 lg:px-20 sm:py-14 pb-[100px] bg-white dark:bg-[#0a0c10] border border-black/5 dark:border-white/5 rounded-[24px] shadow-sm">
        
        <header className="relative z-10 pb-10 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Tutorial
            </span>
            {category && (
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {category}
              </span>
            )}
          </div>
          
          <h1 className="m-0 max-w-[900px] font-sans font-bold text-[clamp(32px,4vw,48px)] leading-[1.2] tracking-tight text-gray-900 dark:text-white">
            {title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mt-8 text-gray-600 dark:text-gray-400 text-sm font-sans">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300">
                {authorName?.charAt(0) || 'A'}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900 dark:text-gray-200">{authorName}</span>
                <span className="text-xs">{authorRole}</span>
              </div>
            </div>
            
            <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700 mx-2" />
            
            <div className="flex items-center gap-1.5">
              ◷ {pubDate}
            </div>
            <div className="flex items-center gap-1.5">
              ◴ {readingTime} phút đọc
            </div>
          </div>
        </header>

        <div 
          className="pt-12 font-sans tutorial-prose text-gray-800 dark:text-gray-200 leading-relaxed" 
          style={{ fontSize: `${fontSize}px` }}
        >
          {excerpt && (
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed font-medium">
              {excerpt}
            </p>
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
            className="prose dark:prose-invert max-w-none 
              prose-p:my-6 prose-p:leading-relaxed 
              prose-headings:font-sans prose-headings:font-bold prose-headings:tracking-tight 
              prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-3xl prose-h2:text-gray-900 dark:prose-h2:text-white 
              prose-h3:mt-8 prose-h3:mb-4 prose-h3:text-2xl prose-h3:text-gray-800 dark:prose-h3:text-gray-100 
              prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-bold 
              prose-a:text-emerald-600 dark:prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-xl prose-img:shadow-md prose-img:mx-auto ql-editor-display"
            dangerouslySetInnerHTML={{ __html: sanitizePostHtml(contentHtml) }}
          />

          {children}

          <div className="tutorial-nav-cards">
            <a href="#" className="tutorial-nav-card prev">
              <span className="tutorial-nav-label">Bài trước</span>
              <span className="tutorial-nav-title">Tính năng đang phát triển</span>
            </a>
            <a href="#" className="tutorial-nav-card next">
              <span className="tutorial-nav-label">Bài sau</span>
              <span className="tutorial-nav-title">Sắp ra mắt</span>
            </a>
          </div>
        </div>
      </article>

      <div className="fixed z-[600] left-1/2 bottom-[25px] -translate-x-1/2 flex items-center gap-1 p-1.5 border border-black/10 dark:border-white/10 rounded-2xl bg-white/90 dark:bg-[#101217]/90 shadow-xl backdrop-blur-xl">
        <button 
          onClick={() => setFontSize(Math.max(15, fontSize - 1))}
          className="w-9 h-9 grid place-items-center border-0 rounded-xl bg-transparent text-gray-500 dark:text-gray-400 cursor-pointer transition-colors hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
          title="Giảm font"
        >
          A−
        </button>
        <div className="min-w-[40px] text-center text-gray-500 dark:text-gray-400 text-xs font-semibold">
          {fontSize}
        </div>
        <button 
          onClick={() => setFontSize(Math.min(22, fontSize + 1))}
          className="w-9 h-9 grid place-items-center border-0 rounded-xl bg-transparent text-gray-500 dark:text-gray-400 cursor-pointer transition-colors hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
          title="Tăng font"
        >
          A+
        </button>
        <div className="w-[1px] h-4 bg-gray-200 dark:bg-white/10 mx-1" />
        <button 
          onClick={() => setReadingMode(!readingMode)}
          className={`w-9 h-9 grid place-items-center border-0 rounded-xl cursor-pointer transition-colors ${readingMode ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'}`}
          title="Reading mode"
        >
          ◐
        </button>
      </div>

      {searchOpen && (
        <div className="fixed z-[2000] inset-0 flex items-start justify-center pt-[15vh] bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={(e) => { if(e.target === e.currentTarget) setSearchOpen(false) }}>
          <div className="w-[min(600px,calc(100%-32px))] overflow-hidden border border-black/10 dark:border-white/10 rounded-2xl bg-white dark:bg-[#111419] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <input 
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full px-6 py-5 border-0 outline-none bg-transparent text-gray-900 dark:text-white text-lg font-sans placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Tìm trong bài viết... (Nhấn Enter để tìm)"
            />
          </div>
        </div>
      )}
    </>
  )
}
