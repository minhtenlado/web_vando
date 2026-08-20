'use client'

import * as React from "react"
import { 
  MessageSquare, 
  Share2, 
  Heart,
  ChevronDown,
  ChevronUp,
  Sparkles
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
  delay: number
}

const PARTICLE_COLORS = [
  "#FF1493", // Deep Pink
  "#FF0055", // Crimson Rose
  "#FF4500", // Orange Red
  "#FF69B4", // Hot Pink
  "#FFA500", // Gold Orange
  "#FF1744", // Vibrant Red
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
    const count = 12 // 12 burst particles in circle

    for (let i = 0; i < count; i++) {
      const angle = (i * 360) / count + (Math.random() * 20 - 10)
      const distance = 30 + Math.random() * 25
      const rad = (angle * Math.PI) / 180
      const x = Math.cos(rad) * distance
      const y = Math.sin(rad) * distance

      newParticles.push({
        id: Date.now() + i,
        x,
        y,
        color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
        size: Math.random() * 4 + 4,
        delay: Math.random() * 0.05,
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

  return (
    <>
      <style jsx>{`
        @keyframes heartPop {
          0% {
            transform: scale(1);
          }
          20% {
            transform: scale(0.75);
          }
          50% {
            transform: scale(1.4) rotate(-5deg);
          }
          75% {
            transform: scale(0.95) rotate(3deg);
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
            opacity: 0.9;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) scale(0);
            opacity: 0;
          }
        }

        @keyframes ringPulse {
          0% {
            transform: scale(0.8);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }

        .animate-heart-pop {
          animation: heartPop 0.65s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        .particle-item {
          animation: particleBurst 0.75s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        .animate-ring-pulse {
          animation: ringPulse 0.6s ease-out forwards;
        }
      `}</style>

      <div className="my-8 rounded-[28px] border border-black/5 dark:border-white/10 bg-gradient-to-b from-white/90 via-white/80 to-white/70 dark:from-[#13161d]/90 dark:via-[#11141a]/85 dark:to-[#0f1117]/80 shadow-[0_12px_45px_rgba(0,0,0,0.05)] dark:shadow-[0_12px_45px_rgba(0,0,0,0.35)] backdrop-blur-2xl p-4 sm:p-5 transition-all">
        {/* TOP: Metric Counter Bar */}
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground pb-3.5 border-b border-border/35 select-none">
          {/* Left: Heart Badge + Likes count */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#FF0055] via-[#FF1493] to-[#FF4500] text-white flex items-center justify-center shadow-md shadow-rose-500/30 ring-2 ring-rose-500/20">
                <Heart className="w-3 h-3 fill-white text-white" />
              </div>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="font-bold text-foreground font-mono text-[14px]">
                {likesCount}
              </span>
              <span className="text-[12px] text-muted-foreground/90 font-medium">
                yêu thích
              </span>
            </div>
          </div>

          {/* Right: Comments Count & Shares Count */}
          <div className="flex items-center gap-3 text-[12px] sm:text-[13px]">
            <button
              type="button"
              onClick={onToggleComments}
              className="group flex items-center gap-1.5 font-medium hover:text-foreground text-muted-foreground transition-all duration-200 cursor-pointer"
            >
              <span className="group-hover:underline">{commentsCount} bình luận</span>
              <span className="p-0.5 rounded-full bg-muted/60 group-hover:bg-primary/15 group-hover:text-primary transition-colors">
                {isCommentsOpen ? (
                  <ChevronUp className="w-3 h-3 text-primary" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </span>
            </button>

            <span className="text-muted-foreground/40">•</span>

            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="font-medium hover:underline hover:text-foreground text-muted-foreground transition-colors cursor-pointer"
            >
              <span>{sharesCount} lượt chia sẻ</span>
            </button>
          </div>
        </div>

        {/* BOTTOM: 3 Big Social Action Buttons */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-3">
          {/* 1. Heart Reaction Button (with Twitter/Instagram-style Particle Explosion) */}
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

            {/* Pulsing ring when clicked */}
            {isHeartPopping && (
              <div className="absolute inset-0 rounded-2xl border-2 border-rose-500 pointer-events-none animate-ring-pulse z-20" />
            )}

            <button
              type="button"
              onClick={handleLikeClick}
              className={`group relative w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 px-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer active:scale-95 select-none ${
                hasLiked
                  ? "text-rose-500 bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/30 shadow-sm shadow-rose-500/15"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent"
              }`}
            >
              <Heart 
                className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-300 ${
                  hasLiked ? "fill-rose-500 text-rose-500" : "group-hover:scale-115 text-muted-foreground group-hover:text-rose-500"
                } ${isHeartPopping ? "animate-heart-pop" : ""}`} 
              />
              <span className="truncate">{hasLiked ? "Đã thích" : "Thả tim"}</span>
            </button>
          </div>

          {/* 2. Comment Button (Toggles Collapsible Comments) */}
          <button
            type="button"
            onClick={onToggleComments}
            className={`group flex items-center justify-center gap-2 py-2.5 sm:py-3 px-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer active:scale-95 select-none ${
              isCommentsOpen
                ? "text-primary bg-primary/10 dark:bg-primary/15 border border-primary/30 shadow-sm shadow-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent"
            }`}
          >
            <MessageSquare className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-300 ${isCommentsOpen ? "text-primary scale-110" : "group-hover:scale-115"}`} />
            <span className="truncate">Bình luận</span>
          </button>

          {/* 3. Share Button */}
          <button
            type="button"
            onClick={handleShareClick}
            className="group flex items-center justify-center gap-2 py-2.5 sm:py-3 px-2 rounded-2xl text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent transition-all duration-200 cursor-pointer active:scale-95 select-none"
          >
            <Share2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 group-hover:scale-115 transition-transform duration-300" />
            <span className="truncate">Chia sẻ</span>
          </button>
        </div>
      </div>

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
