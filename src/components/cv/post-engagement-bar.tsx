'use client'

import * as React from "react"
import { 
  MessageSquare, 
  Share2, 
  Heart,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowUp,
  Flame,
  Radio
} from "lucide-react"
import { SocialShareModal } from "./social-share-modal"

type PostEngagementBarProps = {
  slug: string
  title: string
  likes: number
  shares?: number
  commentsCount: number
  isCommentsOpen: boolean
  onToggleComments: () => void
}

type Particle = {
  id: number
  x: number
  y: number
  color: string
  size: number
}

const PARTICLE_COLORS = [
  "#FF1493", // Deep Pink
  "#FF0055", // Crimson Rose
  "#FF4500", // Orange Red
  "#10B981", // Cyber Emerald
  "#06B6D4", // Cyber Cyan
  "#8B5CF6", // Cyber Violet
  "#F59E0B", // Amber Gold
]

export function PostEngagementBar({
  slug,
  title,
  likes: initialLikes,
  shares: initialShares = 0,
  commentsCount,
  isCommentsOpen,
  onToggleComments,
}: PostEngagementBarProps) {
  const [likesCount, setLikesCount] = React.useState(initialLikes)
  const [sharesCount, setSharesCount] = React.useState(initialShares)
  const [hasLiked, setHasLiked] = React.useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false)
  const [isHeartPopping, setIsHeartPopping] = React.useState(false)
  const [particles, setParticles] = React.useState<Particle[]>([])

  React.useEffect(() => {
    setHasLiked(localStorage.getItem(`like_${slug}`) === "true")

    // Fetch live stats from API
    fetch(`/api/posts/${slug}/stats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "view" }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.likes !== undefined) setLikesCount(data.likes)
        if (data.bookmarks !== undefined) setSharesCount(data.bookmarks)
      })
      .catch(() => {})
  }, [slug])

  // Trigger Particle Explosion for Heart Reaction
  const triggerParticles = () => {
    const newParticles: Particle[] = []
    const count = 14 // 14 burst particles in radial burst

    for (let i = 0; i < count; i++) {
      const angle = (i * 360) / count + (Math.random() * 20 - 10)
      const distance = 35 + Math.random() * 30
      const rad = (angle * Math.PI) / 180
      const x = Math.cos(rad) * distance
      const y = Math.sin(rad) * distance

      newParticles.push({
        id: Date.now() + i,
        x,
        y,
        color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
        size: Math.random() * 4 + 4,
      })
    }

    setParticles(newParticles)
    setTimeout(() => setParticles([]), 800)
  }

  // Handle Like Toggle
  const handleLikeClick = async () => {
    const nextState = !hasLiked
    setHasLiked(nextState)

    if (nextState) {
      setIsHeartPopping(true)
      triggerParticles()
      setTimeout(() => setIsHeartPopping(false), 700)
    }

    setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)))
    localStorage.setItem(`like_${slug}`, nextState.toString())

    try {
      await fetch(`/api/posts/${slug}/stats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: nextState ? "like" : "unlike" }),
      })
    } catch (err) {
      console.error(err)
    }
  }

  // Handle Share Click
  const handleShareClick = () => {
    if (typeof navigator !== "undefined" && navigator.share && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      navigator.share({
        title,
        text: `Xem bài viết: ${title}`,
        url: window.location.href,
      })
      .then(() => {
        setSharesCount((prev) => prev + 1)
        fetch(`/api/posts/${slug}/stats`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "bookmark" }),
        }).catch(() => {})
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setIsShareModalOpen(true)
        }
      })
    } else {
      setIsShareModalOpen(true)
    }
  }

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <>
      <style jsx>{`
        @keyframes heartPop {
          0% {
            transform: scale(1);
          }
          20% {
            transform: scale(0.7);
          }
          50% {
            transform: scale(1.45) rotate(-6deg);
          }
          75% {
            transform: scale(0.92) rotate(4deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
          }
        }

        @keyframes particleBurst {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          60% {
            opacity: 0.95;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) scale(0);
            opacity: 0;
          }
        }

        @keyframes cyberPulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.85);
          }
        }

        .animate-heart-pop {
          animation: heartPop 0.65s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        .particle-item {
          animation: particleBurst 0.75s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        .animate-cyber-pulse {
          animation: cyberPulse 2s ease-in-out infinite;
        }
      `}</style>

      {/* Futuristic High-Tech Engagement Console */}
      <section className="my-10 relative group">
        {/* Subtle Ambient Glow behind Console */}
        <div className="absolute -inset-1 bg-gradient-to-r from-rose-500/10 via-primary/10 to-cyan-500/10 rounded-[32px] blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none" />

        <div className="relative rounded-[28px] border border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#0c1017]/85 shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl p-4 sm:p-5 transition-all overflow-hidden">
          
          {/* TOP CONSOLE METRIC STRIP */}
          <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground pb-3.5 border-b border-border/25 font-mono">
            {/* Live Indicator */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold tracking-wider uppercase text-foreground/80 font-sans">
                Tương tác & Thảo luận
              </span>
            </div>

            {/* Quick Live Stats Pill */}
            <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-border/40 font-mono">
                <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />
                <span>{likesCount}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-border/40 font-mono">
                <MessageSquare className="w-2.5 h-2.5 text-primary" />
                <span>{commentsCount}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-border/40 font-mono">
                <Share2 className="w-2.5 h-2.5 text-cyan-500" />
                <span>{sharesCount}</span>
              </span>
            </div>
          </div>

          {/* MAIN INTERACTIVE CAPSULES (Unibody Cyber Action Deck) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5">
            {/* Left: Primary Reaction & Discussion Capsules */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 flex-1">
              
              {/* 1. Cyber Heart Pill */}
              <div className="relative flex items-center justify-center">
                {/* Burst Particles */}
                {particles.map((p) => (
                  <div
                    key={p.id}
                    className="absolute pointer-events-none z-30 particle-item"
                    style={
                      {
                        "--tx": `${p.x}px`,
                        "--ty": `${p.y}px`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        backgroundColor: p.color,
                        borderRadius: "50%",
                        boxShadow: `0 0 8px ${p.color}`,
                      } as React.CSSProperties
                    }
                  />
                ))}

                <button
                  type="button"
                  onClick={handleLikeClick}
                  className={`group relative flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer active:scale-95 select-none border ${
                    hasLiked
                      ? "text-rose-400 bg-rose-500/15 border-rose-500/40 shadow-[0_0_25px_rgba(244,63,94,0.25)]"
                      : "text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted/70 border-border/40 hover:border-rose-500/30"
                  }`}
                  title={hasLiked ? "Bỏ yêu thích" : "Thả tim bài viết"}
                >
                  <div className="relative flex items-center justify-center">
                    <Heart 
                      className={`w-4 h-4 transition-transform duration-300 ${
                        hasLiked 
                          ? "fill-rose-500 text-rose-500" 
                          : "text-muted-foreground group-hover:text-rose-500 group-hover:scale-115"
                      } ${isHeartPopping ? "animate-heart-pop" : ""}`} 
                    />
                  </div>
                  <span>{hasLiked ? "Đã yêu thích" : "Thả tim"}</span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 font-bold ml-0.5">
                    {likesCount}
                  </span>
                </button>
              </div>

              {/* 2. Cyber Discussion Pill */}
              <button
                type="button"
                onClick={onToggleComments}
                className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer active:scale-95 select-none border ${
                  isCommentsOpen
                    ? "text-primary bg-primary/15 border-primary/40 shadow-[0_0_25px_rgba(16,185,129,0.2)]"
                    : "text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted/70 border-border/40 hover:border-primary/30"
                }`}
                title={isCommentsOpen ? "Thu gọn bình luận" : "Mở khung thảo luận"}
              >
                <MessageSquare className={`w-4 h-4 transition-transform duration-300 ${isCommentsOpen ? "text-primary scale-110" : "group-hover:scale-115 group-hover:text-primary"}`} />
                <span>{isCommentsOpen ? "Đang thảo luận" : "Bình luận"}</span>
                <span className={`font-mono text-xs px-2 py-0.5 rounded-full font-bold ml-0.5 ${
                  isCommentsOpen ? "bg-primary/20 text-primary" : "bg-black/10 dark:bg-white/10"
                }`}>
                  {commentsCount}
                </span>
                {isCommentsOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-primary ml-0.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground ml-0.5" />
                )}
              </button>

            </div>

            {/* Right: Share Node & Top Anchor */}
            <div className="flex items-center gap-2">
              {/* Share Pill */}
              <button
                type="button"
                onClick={handleShareClick}
                className="group flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted/70 border border-border/40 hover:border-cyan-500/30 transition-all duration-200 cursor-pointer active:scale-95 select-none hover:shadow-sm"
                title="Chia sẻ bài viết này"
              >
                <Share2 className="w-4 h-4 group-hover:scale-115 group-hover:text-cyan-400 transition-all duration-300" />
                <span>Chia sẻ</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 font-bold ml-0.5">
                  {sharesCount}
                </span>
              </button>

              {/* Scroll to Top Pill */}
              <button
                type="button"
                onClick={scrollToTop}
                className="p-2.5 rounded-2xl text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted/70 border border-border/40 hover:border-primary/30 transition-all duration-200 cursor-pointer active:scale-95"
                title="Về đầu bài viết"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Social Share Modal Popup */}
      <SocialShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        slug={slug}
        title={title}
        onShareSuccess={() => setSharesCount((prev) => prev + 1)}
      />
    </>
  )
}
