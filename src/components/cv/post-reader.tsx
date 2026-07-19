'use client'

import * as React from "react"
import { CalendarDays, Clock, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

type PostReaderProps = {
  title: string
  pubDate: string
  readingTime: number
  contentHtml: string
  children?: React.ReactNode
}

export function PostReader({ title, pubDate, readingTime, contentHtml, children }: PostReaderProps) {
  const [zoom, setZoom] = React.useState(100)

  // Minimum and maximum zoom levels
  const MIN_ZOOM = 70
  const MAX_ZOOM = 200

  // Handle Ctrl+Scroll
  React.useEffect(() => {
    // 1. Load highlight.js for code syntax highlighting
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css"
    document.head.appendChild(link)

    const highlightBlocks = () => {
      // @ts-ignore
      if (window.hljs) {
        document.querySelectorAll('pre.ql-syntax').forEach((block) => {
          // @ts-ignore
          window.hljs.highlightElement(block);
        });
      }
    }

    // @ts-ignore
    let scriptElement = null;

    // @ts-ignore
    if (window.hljs) {
      highlightBlocks();
    } else {
      const script = document.createElement("script")
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"
      script.onload = highlightBlocks
      document.body.appendChild(script)
      scriptElement = script;
    }

    // 2. Zoom handling
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -10 : 10
        setZoom((prev) => Math.min(Math.max(prev + delta, MIN_ZOOM), MAX_ZOOM))
      }
    }

    window.addEventListener("wheel", handleWheel, { passive: false })
    return () => {
      window.removeEventListener("wheel", handleWheel)
      if (document.head.contains(link)) document.head.removeChild(link)
      if (scriptElement && document.body.contains(scriptElement)) document.body.removeChild(scriptElement)
    }
  }, [contentHtml])

  return (
    <article className="flex-1 w-full max-w-7xl mx-auto flex flex-col relative">
      
      {/* Zoom Controls Overlay (Visible on hover or large screens) */}
      <div className="fixed bottom-6 right-6 lg:absolute lg:top-0 lg:right-[-4rem] lg:bottom-auto z-50 flex lg:flex-col gap-2 bg-background/80 backdrop-blur-md p-1.5 rounded-full border shadow-sm opacity-50 hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setZoom(z => Math.min(z + 10, MAX_ZOOM))} title="Phóng to (Ctrl + Cuộn lên)">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <span className="flex items-center justify-center text-[10px] font-mono w-8">{zoom}%</span>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setZoom(z => Math.max(z - 10, MIN_ZOOM))} title="Thu nhỏ (Ctrl + Cuộn xuống)">
          <ZoomOut className="h-4 w-4" />
        </Button>
        {zoom !== 100 && (
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground" onClick={() => setZoom(100)} title="Khôi phục mặc định">
            <RotateCcw className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* The "Paper" Document */}
      <div 
        className="bg-card text-card-foreground border rounded-none sm:rounded-xl shadow-2xl min-h-[80vh] overflow-hidden"
        style={{ fontSize: `${zoom}%`, transition: "font-size 0.15s ease-out" }}
      >
        <div className="p-8 sm:p-12 md:p-16 lg:p-20 max-w-5xl mx-auto w-full">
          <header className="mb-10 md:mb-14 border-b pb-8">
            <h1 className="text-[2.25em] leading-[1.2] font-bold font-serif mb-6">
              {title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-[0.875em] text-muted-foreground font-sans">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-[1.2em] w-[1.2em]" />
                <time>{pubDate}</time>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-[1.2em] w-[1.2em]" />
                <span>{readingTime} phút đọc</span>
              </div>
            </div>
          </header>

          <div 
            className="prose prose-slate dark:prose-invert max-w-none break-words whitespace-pre-wrap
              font-serif 
              prose-headings:font-sans prose-headings:font-bold prose-headings:leading-tight
              prose-p:leading-relaxed prose-p:text-foreground/90
              prose-a:text-primary hover:prose-a:text-primary/80
              prose-img:rounded-xl prose-img:shadow-md prose-img:mx-auto
              prose-pre:bg-zinc-950 prose-pre:text-zinc-50 prose-pre:border prose-pre:border-zinc-800 prose-pre:shadow-sm
              prose-code:text-pink-500 prose-code:bg-pink-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
              [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:rounded-xl [&_iframe]:shadow-md
              ql-editor-display"
            style={{ fontSize: '1em' }}
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>
      </div>

      {children && (
        <div className="w-full">
          {children}
        </div>
      )}
    </article>
  )
}
