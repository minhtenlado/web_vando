'use client'

import * as React from "react"
import { 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Heart,
  ChevronDown,
  ChevronUp
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
  const [likeAnimating, setLikeAnimating] = React.useState(false)

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

  // Handle Like Toggle
  const handleLikeClick = async () => {
    const nextState = !hasLiked
    setHasLiked(nextState)
    setLikeAnimating(true)
    setTimeout(() => setLikeAnimating(false), 500)

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
    // If mobile supports native share, trigger it directly for seamless UX
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
      <div className="my-8 rounded-[24px] border border-black/5 dark:border-white/10 bg-white/80 dark:bg-[#12151c]/90 shadow-[0_10px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl p-4 sm:p-5 transition-all">
        {/* TOP: Metric Counter Bar (Matching Reference Image) */}
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground pb-3 border-b border-border/30 select-none">
          {/* Left: Overlapping Reaction Icons + Likes count */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {/* Thumbs Up Circle */}
              <div className="w-5 h-5 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-sm z-10">
                <ThumbsUp className="w-2.5 h-2.5 fill-white text-white stroke-[2.5]" />
              </div>
              {/* Heart Circle (Overlapping) */}
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#FA383E] to-[#F12B2C] text-white flex items-center justify-center shadow-sm -ml-1.5 z-20">
                <Heart className="w-2.5 h-2.5 fill-white text-white" />
              </div>
            </div>

            <span className="font-semibold text-foreground/90 font-mono text-[13px] ml-0.5">
              {likesCount}
            </span>
          </div>

          {/* Right: Comments Count & Shares Count */}
          <div className="flex items-center gap-3 text-[12px] sm:text-[13px]">
            <button
              type="button"
              onClick={onToggleComments}
              className="hover:underline hover:text-foreground transition-colors cursor-pointer flex items-center gap-1 font-medium"
            >
              <span>{commentsCount} bình luận</span>
              {isCommentsOpen ? (
                <ChevronUp className="w-3 h-3 text-primary" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>

            <span>•</span>

            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="hover:underline hover:text-foreground transition-colors cursor-pointer font-medium"
            >
              <span>{sharesCount} lượt chia sẻ</span>
            </button>
          </div>
        </div>

        {/* BOTTOM: 3 Big Social Action Buttons (Facebook UI Style) */}
        <div className="grid grid-cols-3 gap-2 pt-2.5">
          {/* 1. Like Button */}
          <button
            type="button"
            onClick={handleLikeClick}
            className={`group flex items-center justify-center gap-2 py-2.5 sm:py-3 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
              hasLiked
                ? "text-[#1877F2] bg-[#1877F2]/10 dark:bg-[#1877F2]/15 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <ThumbsUp 
              className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-300 ${
                hasLiked ? "fill-current scale-110" : "group-hover:scale-115"
              } ${likeAnimating ? "animate-bounce" : ""}`} 
            />
            <span className="truncate">{hasLiked ? "Đã thích" : "Thích"}</span>
          </button>

          {/* 2. Comment Button (Toggles Collapsible Comments) */}
          <button
            type="button"
            onClick={onToggleComments}
            className={`group flex items-center justify-center gap-2 py-2.5 sm:py-3 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
              isCommentsOpen
                ? "text-primary bg-primary/10 dark:bg-primary/15 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <MessageSquare className="w-4 h-4 sm:w-4.5 sm:h-4.5 group-hover:scale-115 transition-transform" />
            <span className="truncate">Bình luận</span>
          </button>

          {/* 3. Share Button */}
          <button
            type="button"
            onClick={handleShareClick}
            className="group flex items-center justify-center gap-2 py-2.5 sm:py-3 px-2 rounded-xl text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 cursor-pointer"
          >
            <Share2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 group-hover:scale-115 transition-transform" />
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
