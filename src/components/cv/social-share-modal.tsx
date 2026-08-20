'use client'

import * as React from "react"
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  Smartphone, 
  Mail, 
  Globe, 
  Sparkles,
  ExternalLink
} from "lucide-react"

type SocialShareModalProps = {
  isOpen: boolean
  onClose: () => void
  slug: string
  title: string
  url?: string
  onShareSuccess?: () => void
}

export function SocialShareModal({
  isOpen,
  onClose,
  slug,
  title,
  url: customUrl,
  onShareSuccess,
}: SocialShareModalProps) {
  const [copied, setCopied] = React.useState(false)
  const [shareUrl, setShareUrl] = React.useState("")

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(customUrl || window.location.href)
    }
  }, [customUrl, isOpen])

  // Track share count in database
  const recordShare = React.useCallback(async () => {
    try {
      await fetch(`/api/posts/${slug}/stats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bookmark" }), // using bookmarks column as shares
      })
      if (onShareSuccess) onShareSuccess()
    } catch {}
  }, [slug, onShareSuccess])

  if (!isOpen) return null

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      recordShare()
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback
      setCopied(true)
    }
  }

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Xem bài viết: ${title}`,
          url: shareUrl,
        })
        recordShare()
        onClose()
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Native share error", err)
        }
      }
    } else {
      handleCopyLink()
    }
  }

  const openShareWindow = (targetUrl: string) => {
    recordShare()
    if (typeof window !== "undefined") {
      window.open(targetUrl, "_blank", "width=600,height=550,noopener,noreferrer")
    }
  }

  // Social Links
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedTitle = encodeURIComponent(title)

  const shareOptions = [
    {
      id: "facebook",
      name: "Facebook",
      icon: (
        <div className="w-11 h-11 rounded-2xl bg-[#1877F2] text-white flex items-center justify-center shadow-md shadow-[#1877F2]/25 group-hover:scale-110 transition-transform">
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </div>
      ),
      onClick: () => openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`),
    },
    {
      id: "messenger",
      name: "Messenger",
      icon: (
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0084FF] to-[#A033FF] text-white flex items-center justify-center shadow-md shadow-[#0084FF]/25 group-hover:scale-110 transition-transform">
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.47 8.652v4.237l4.086-2.242c1.09.301 2.246.464 3.444.464 6.627 0 12-4.974 12-11.111C24 4.974 18.627 0 12 0zm1.196 14.957l-3.056-3.26-5.967 3.26 6.56-6.969 3.13 3.26 5.892-3.26-6.559 6.969z"/>
          </svg>
        </div>
      ),
      onClick: () => {
        // Mobile scheme vs Desktop dialog
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
        if (isMobile) {
          window.location.href = `fb-messenger://share/?link=${encodedUrl}&app_id=2941183923177148`
        } else {
          openShareWindow(`https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=2941183923177148&redirect_uri=${encodedUrl}`)
        }
      },
    },
    {
      id: "zalo",
      name: "Zalo",
      icon: (
        <div className="w-11 h-11 rounded-2xl bg-[#0068FF] text-white flex items-center justify-center font-bold text-sm shadow-md shadow-[#0068FF]/25 group-hover:scale-110 transition-transform">
          <span className="tracking-tighter font-sans font-extrabold text-[15px]">Zalo</span>
        </div>
      ),
      onClick: () => openShareWindow(`https://sp.zalo.me/plugins/share?url=${encodedUrl}&title=${encodedTitle}`),
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: (
        <div className="w-11 h-11 rounded-2xl bg-[#0A66C2] text-white flex items-center justify-center shadow-md shadow-[#0A66C2]/25 group-hover:scale-110 transition-transform">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
          </svg>
        </div>
      ),
      onClick: () => openShareWindow(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`),
    },
    {
      id: "twitter",
      name: "X (Twitter)",
      icon: (
        <div className="w-11 h-11 rounded-2xl bg-black dark:bg-zinc-800 text-white flex items-center justify-center shadow-md shadow-black/25 group-hover:scale-110 transition-transform border border-white/10">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </div>
      ),
      onClick: () => openShareWindow(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`),
    },
    {
      id: "gmail",
      name: "Gmail / Email",
      icon: (
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#EA4335] to-[#FBBC05] text-white flex items-center justify-center shadow-md shadow-[#EA4335]/25 group-hover:scale-110 transition-transform">
          <Mail className="w-5 h-5" />
        </div>
      ),
      onClick: () => {
        recordShare()
        window.location.href = `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(`Xin chào,\n\nMình muốn chia sẻ với bạn bài viết này từ Phan Huỳnh Văn Đô:\n"${title}"\n\nXem chi tiết tại: ${shareUrl}`)}`
      },
    },
  ]

  const hasNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function"

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md rounded-[28px] border border-black/10 dark:border-white/15 bg-white/95 dark:bg-[#0f1318]/95 p-6 sm:p-7 shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl space-y-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground flex items-center gap-1.5">
                Chia sẻ bài viết
              </h3>
              <p className="text-xs text-muted-foreground truncate max-w-[240px]">
                {title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Social Platforms Grid */}
        <div className="grid grid-cols-3 gap-3">
          {shareOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={opt.onClick}
              className="group flex flex-col items-center gap-2 p-3 rounded-2xl border border-transparent hover:border-border/50 hover:bg-muted/40 transition-all cursor-pointer"
            >
              {opt.icon}
              <span className="text-xs font-semibold text-foreground/90 group-hover:text-primary transition-colors">
                {opt.name}
              </span>
            </button>
          ))}
        </div>

        {/* Native Mobile Share Button (if supported) */}
        {hasNativeShare && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-primary/15 via-primary/10 to-emerald-500/10 border border-primary/25 hover:border-primary/40 text-primary text-xs font-bold transition-all shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Smartphone className="w-4 h-4" />
            <span>Mở menu chia sẻ của điện thoại</span>
          </button>
        )}

        {/* Copy Link Section */}
        <div className="space-y-2 pt-2 border-t border-border/30">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Sao chép liên kết trực tiếp
          </label>
          <div className="flex items-center gap-2 p-1.5 rounded-xl border border-border/60 bg-muted/40 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="w-full px-2.5 py-1 text-xs bg-transparent border-0 outline-none text-foreground truncate font-mono"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                copied
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20"
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Đã sao chép!" : "Sao chép"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
