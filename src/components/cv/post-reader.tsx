'use client'

import * as React from "react"
import { CalendarDays, Clock, ZoomIn, ZoomOut, RotateCcw, FileText, Download, ChevronDown } from "lucide-react"
import { sanitizePostHtml } from "@/lib/validation"
import { Button } from "@/components/ui/button"

type PostReaderProps = {
  title: string
  pubDate: string
  readingTime: number
  contentHtml: string
  pdfUrl?: string | null
  children?: React.ReactNode
}

export function PostReader({ title, pubDate, readingTime, contentHtml, pdfUrl, children }: PostReaderProps) {
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
        document.querySelectorAll('.ql-editor-display pre').forEach((block) => {
          // @ts-ignore
          window.hljs.highlightElement(block);
        });
      }
    }

    let scriptElement: HTMLScriptElement | null = null;

    // @ts-ignore
    if (!document.querySelector('script[src*="highlight.js"]')) {
      const script = document.createElement("script")
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"
      script.onload = highlightBlocks
      document.body.appendChild(script)
      scriptElement = script;
    } else if ((window as any).hljs) {
      highlightBlocks();
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
        className="bg-card text-card-foreground border-0 sm:border rounded-none sm:rounded-xl shadow-none sm:shadow-2xl min-h-[80vh] overflow-hidden"
        style={{ fontSize: `${zoom}%`, transition: "font-size 0.15s ease-out" }}
      >
        <div className="mx-auto w-full max-w-5xl px-3 py-5 sm:p-12 md:p-16 lg:p-20">
          <header className="mb-6 sm:mb-10 md:mb-14 border-b pb-6 sm:pb-8">
            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-[2.25em] leading-[1.3] sm:leading-[1.2] font-bold font-serif mb-4 sm:mb-6 tracking-tight text-foreground">
              {title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-[0.875em] text-muted-foreground font-sans">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 sm:h-[1.2em] sm:w-[1.2em]" />
                <time>{pubDate}</time>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 sm:h-[1.2em] sm:w-[1.2em]" />
                <span>{readingTime} phút đọc</span>
              </div>
            </div>
          </header>

          {/* PDF Viewer UI (Moved to Top) */}
          {pdfUrl && (
            <div className="mb-10 w-full flex flex-col items-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center w-full mb-6">
                <a 
                  href={pdfUrl} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 border-2 border-border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-12 px-8 w-full sm:w-auto active:scale-95"
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Mở Trực Tiếp Trên Tab Khác
                </a>
                
                <a 
                  href={pdfUrl} 
                  download 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg h-12 px-8 w-full sm:w-auto active:scale-95"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Tải File PDF Về Máy
                </a>
              </div>

              {/* iframe for PDF */}
              <div className="w-full h-[500px] sm:h-[700px] lg:h-[900px] rounded-xl overflow-hidden border shadow-inner bg-zinc-100 dark:bg-zinc-900/50">
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

          {pdfUrl ? (
            <details className="w-full mt-2 group border border-border rounded-xl mb-10">
              <summary className="cursor-pointer p-4 font-semibold text-foreground flex items-center justify-between bg-muted/30 hover:bg-muted/50 rounded-xl group-open:rounded-b-none group-open:border-b border-border transition-colors">
                <span className="flex items-center"><FileText className="w-5 h-5 mr-2" /> Bản xem trước nội dung Text (Dành cho SEO / Trích xuất nhanh)</span>
                <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180" />
              </summary>
              <div className="p-4 sm:p-6 bg-background rounded-b-xl">
                <div 
                  className="prose prose-slate dark:prose-invert max-w-none font-sans text-base sm:text-lg prose-headings:font-sans prose-headings:font-bold prose-headings:leading-tight prose-headings:tracking-tight prose-h1:text-xl sm:prose-h1:text-3xl prose-h2:text-lg sm:prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-base sm:prose-h3:text-xl prose-h3:mt-5 prose-h3:mb-2 prose-p:leading-relaxed sm:prose-p:leading-relaxed prose-p:text-foreground/90 prose-p:my-3 sm:prose-p:my-4 prose-li:my-1 sm:prose-li:my-2 prose-a:text-primary hover:prose-a:text-primary/80 prose-a:break-words prose-img:rounded-lg sm:prose-img:rounded-xl prose-img:shadow-md prose-img:mx-auto prose-img:max-w-full prose-img:h-auto prose-pre:bg-zinc-950 prose-pre:text-zinc-50 prose-pre:border prose-pre:border-zinc-800 prose-pre:shadow-sm prose-pre:text-xs sm:prose-pre:text-sm prose-pre:p-3 sm:prose-pre:p-4 prose-pre:rounded-lg sm:prose-pre:rounded-xl prose-pre:overflow-x-auto prose-code:text-pink-500 prose-code:bg-pink-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-code:break-words prose-table:w-full prose-td:border prose-td:border-border prose-th:border prose-th:border-border prose-td:p-2 sm:prose-td:p-3 prose-th:p-2 sm:prose-th:p-3 prose-th:bg-muted/50 [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:rounded-lg sm:[&_iframe]:rounded-xl [&_iframe]:shadow-md ql-editor-display"
                  style={{ fontSize: '1em' }}
                  dangerouslySetInnerHTML={{ __html: sanitizePostHtml(contentHtml) }}
                />
              </div>
            </details>
          ) : (
            <div 
              className="prose prose-slate dark:prose-invert max-w-none font-sans text-base sm:text-lg prose-headings:font-sans prose-headings:font-bold prose-headings:leading-tight prose-headings:tracking-tight prose-h1:text-xl sm:prose-h1:text-3xl prose-h2:text-lg sm:prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-base sm:prose-h3:text-xl prose-h3:mt-5 prose-h3:mb-2 prose-p:leading-relaxed sm:prose-p:leading-relaxed prose-p:text-foreground/90 prose-p:my-3 sm:prose-p:my-4 prose-li:my-1 sm:prose-li:my-2 prose-a:text-primary hover:prose-a:text-primary/80 prose-a:break-words prose-img:rounded-lg sm:prose-img:rounded-xl prose-img:shadow-md prose-img:mx-auto prose-img:max-w-full prose-img:h-auto prose-pre:bg-zinc-950 prose-pre:text-zinc-50 prose-pre:border prose-pre:border-zinc-800 prose-pre:shadow-sm prose-pre:text-xs sm:prose-pre:text-sm prose-pre:p-3 sm:prose-pre:p-4 prose-pre:rounded-lg sm:prose-pre:rounded-xl prose-pre:overflow-x-auto prose-code:text-pink-500 prose-code:bg-pink-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-code:break-words prose-table:w-full prose-td:border prose-td:border-border prose-th:border prose-th:border-border prose-td:p-2 sm:prose-td:p-3 prose-th:p-2 sm:prose-th:p-3 prose-th:bg-muted/50 [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:rounded-lg sm:[&_iframe]:rounded-xl [&_iframe]:shadow-md ql-editor-display"
              style={{ fontSize: '1em' }}
              dangerouslySetInnerHTML={{ __html: sanitizePostHtml(contentHtml) }}
            />
          )}
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
