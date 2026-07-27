'use client'

import * as React from "react"
import { Download, ExternalLink, RefreshCw, FileText } from "lucide-react"

type PdfViewerProps = {
  pdfUrl: string
  title: string
}

export function PdfViewer({ pdfUrl, title }: PdfViewerProps) {
  const [useGoogleViewer, setUseGoogleViewer] = React.useState(true)
  const [fullUrl, setFullUrl] = React.useState(pdfUrl)

  React.useEffect(() => {
    if (pdfUrl.startsWith("http://") || pdfUrl.startsWith("https://")) {
      setFullUrl(pdfUrl)
    } else if (typeof window !== "undefined") {
      setFullUrl(`${window.location.origin}${pdfUrl}`)
    }
  }, [pdfUrl])

  const googleDocsViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(fullUrl)}&embedded=true`

  return (
    <div className="flex-1 w-full h-full flex flex-col relative bg-zinc-100 dark:bg-zinc-900">
      {/* Mobile-friendly banner notification & quick action bar */}
      <div className="flex-none bg-zinc-200/90 dark:bg-zinc-800/90 border-b border-border/60 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileText className="h-4 w-4 text-primary shrink-0" />
          <span className="truncate max-w-[200px] sm:max-w-md font-medium text-foreground">{title}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <button
            onClick={() => setUseGoogleViewer(!useGoogleViewer)}
            className="px-2.5 py-1 rounded bg-background/80 hover:bg-background border border-border text-foreground transition-colors flex items-center gap-1.5 font-medium"
            title="Đổi trình hiển thị PDF"
          >
            <RefreshCw className="h-3 w-3" />
            <span className="hidden sm:inline">Chế độ xem: </span>
            <span>{useGoogleViewer ? "Google Viewer" : "Trình duyệt gốc"}</span>
          </button>
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded bg-primary text-primary-foreground font-medium flex items-center gap-1 hover:opacity-90 transition-opacity"
          >
            <ExternalLink className="h-3 w-3" />
            <span>Mở PDF</span>
          </a>
        </div>
      </div>

      {/* Main PDF Frame */}
      <div className="flex-1 w-full h-full relative overflow-hidden">
        {useGoogleViewer ? (
          <iframe
            src={googleDocsViewerUrl}
            className="absolute inset-0 w-full h-full border-0"
            title={title}
            allow="fullscreen"
          />
        ) : (
          <object
            data={`${fullUrl}#view=FitH&toolbar=1`}
            type="application/pdf"
            className="absolute inset-0 w-full h-full border-0"
          >
            <iframe
              src={googleDocsViewerUrl}
              className="absolute inset-0 w-full h-full border-0"
              title={title}
            />
          </object>
        )}
      </div>
    </div>
  )
}
