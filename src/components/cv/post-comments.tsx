'use client'

import * as React from "react"
import { 
  MessageSquare, 
  Send, 
  User, 
  EyeOff, 
  Sparkles, 
  Heart, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MessageCircle,
  CornerDownRight,
  ChevronDown,
  ChevronUp,
  Flame,
  ArrowUpDown,
  Check
} from "lucide-react"

export type CommentItem = {
  id: string
  postSlug: string
  parentId: string | null
  author: string
  isAnonymous: boolean
  isAuthor?: boolean
  avatarUrl?: string | null
  content: string
  avatarColor: string
  likes: number
  createdAt: string
}

type PostCommentsProps = {
  slug: string
  title: string
  onCommentCountChange?: (count: number) => void
}

const COLOR_MAP: Record<string, string> = {
  emerald: "from-emerald-500 to-teal-600 text-white",
  indigo: "from-indigo-500 to-blue-600 text-white",
  rose: "from-rose-500 to-pink-600 text-white",
  amber: "from-amber-500 to-orange-600 text-white",
  sky: "from-sky-500 to-cyan-600 text-white",
  purple: "from-purple-500 to-violet-600 text-white",
  teal: "from-teal-500 to-emerald-600 text-white",
  pink: "from-pink-500 to-rose-600 text-white",
}

const QUICK_EMOJIS = ["❤️", "👏", "💡", "🔥", "👍", "🚀", "🙌", "✨"]
const PAGE_SIZE = 5
const AUTHOR_AVATAR_FALLBACK = "https://res.cloudinary.com/s4sbshc3/image/upload/v1786817924/web_vando/avatars/eeyk5yoy39vx3iijwnbq.jpg"

function formatRelativeTime(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    const diff = Math.floor((Date.now() - d.getTime()) / 1000)
    if (diff < 60) return "Vừa xong"
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`
    return d.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return dateStr
  }
}

export function PostComments({ slug, title, onCommentCountChange }: PostCommentsProps) {
  const [comments, setComments] = React.useState<CommentItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)
  const [sortBy, setSortBy] = React.useState<"newest" | "likes">("newest")
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE)
  
  // Top-Level Form State
  const [isAnonymous, setIsAnonymous] = React.useState(false)
  const [authorName, setAuthorName] = React.useState("")
  const [content, setContent] = React.useState("")
  const [statusMsg, setStatusMsg] = React.useState<{ text: string; type: "success" | "error" } | null>(null)

  // Reply State: which comment ID is actively being replied to
  const [replyToId, setReplyToId] = React.useState<string | null>(null)
  const [replyAuthorName, setReplyAuthorName] = React.useState("")
  const [replyIsAnonymous, setReplyIsAnonymous] = React.useState(false)
  const [replyContent, setReplyContent] = React.useState("")
  const [replySubmitting, setReplySubmitting] = React.useState(false)

  // Expanded replies map: commentId -> boolean
  const [expandedReplies, setExpandedReplies] = React.useState<Record<string, boolean>>({})

  // Liked comments stored in localStorage
  const [likedMap, setLikedMap] = React.useState<Record<string, boolean>>({})

  // Fetch comments
  const fetchComments = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(slug)}/comments`, { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        const items = data.comments || []
        setComments(items)
        if (onCommentCountChange) {
          onCommentCountChange(items.length)
        }
      }
    } catch (err) {
      console.error("[Fetch Comments Error]", err)
    } finally {
      setLoading(false)
    }
  }, [slug, onCommentCountChange])

  React.useEffect(() => {
    fetchComments()

    // Load liked map from localStorage
    try {
      const stored = localStorage.getItem(`post_cmts_likes_${slug}`)
      if (stored) setLikedMap(JSON.parse(stored))
    } catch {}
  }, [fetchComments, slug])

  // Like / React to a comment
  const handleLikeComment = async (commentId: string) => {
    const isLiked = Boolean(likedMap[commentId])
    const newLikedMap = { ...likedMap, [commentId]: !isLiked }
    setLikedMap(newLikedMap)
    try {
      localStorage.setItem(`post_cmts_likes_${slug}`, JSON.stringify(newLikedMap))
    } catch {}

    // Optimistic UI
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, likes: isLiked ? Math.max(0, (c.likes || 0) - 1) : (c.likes || 0) + 1 }
          : c
      )
    )

    try {
      await fetch(`/api/posts/${encodeURIComponent(slug)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: isLiked ? "unlike" : "like",
          commentId,
        }),
      })
    } catch (err) {
      console.error("[Like Comment Error]", err)
    }
  }

  // Submit Top-Level Comment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || content.trim().length < 2) {
      setStatusMsg({ text: "Vui lòng nhập nội dung bình luận (tối thiểu 2 ký tự).", type: "error" })
      return
    }

    if (!isAnonymous && !authorName.trim()) {
      setStatusMsg({ text: "Vui lòng nhập tên của bạn hoặc chọn 'Bình luận ẩn danh'.", type: "error" })
      return
    }

    setSubmitting(true)
    setStatusMsg(null)

    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(slug)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: authorName.trim(),
          isAnonymous,
          content: content.trim(),
          parentId: null,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (res.ok && data.ok) {
        setStatusMsg({ text: "Bình luận của bạn đã được đăng thành công!", type: "success" })
        setContent("")
        if (data.comment) {
          const updated = [data.comment, ...comments]
          setComments(updated)
          if (onCommentCountChange) onCommentCountChange(updated.length)
        } else {
          fetchComments()
        }
        setTimeout(() => setStatusMsg(null), 4000)
      } else {
        setStatusMsg({ text: data.message || `Lỗi (${res.status}): Không thể gửi bình luận.`, type: "error" })
      }
    } catch (err) {
      console.error("[Submit Comment Error]", err)
      setStatusMsg({ text: "Đã xảy ra lỗi kết nối, vui lòng thử lại sau.", type: "error" })
    } finally {
      setSubmitting(false)
    }
  }

  // Submit Reply to a comment
  const handleReplySubmit = async (parentId: string, e: React.FormEvent) => {
    e.preventDefault()
    if (!replyContent.trim() || replyContent.trim().length < 2) return
    if (!replyIsAnonymous && !replyAuthorName.trim()) return

    setReplySubmitting(true)

    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(slug)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: replyAuthorName.trim(),
          isAnonymous: replyIsAnonymous,
          content: replyContent.trim(),
          parentId,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (res.ok && data.ok && data.comment) {
        const updated = [...comments, data.comment]
        setComments(updated)
        if (onCommentCountChange) onCommentCountChange(updated.length)
        setReplyToId(null)
        setReplyContent("")
        // Automatically expand replies for this parent
        setExpandedReplies((prev) => ({ ...prev, [parentId]: true }))
      }
    } catch (err) {
      console.error("[Submit Reply Error]", err)
    } finally {
      setReplySubmitting(false)
    }
  }

  // Build tree: top-level comments and map of replies
  const topLevelComments = React.useMemo(() => {
    let list = comments.filter((c) => !c.parentId)
    if (sortBy === "likes") {
      list = [...list].sort((a, b) => (b.likes || 0) - (a.likes || 0))
    } else {
      list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
    return list
  }, [comments, sortBy])

  const repliesByParent = React.useMemo(() => {
    const map: Record<string, CommentItem[]> = {}
    for (const c of comments) {
      if (c.parentId) {
        if (!map[c.parentId]) map[c.parentId] = []
        map[c.parentId].push(c)
      }
    }
    // Sort replies chronologically (oldest first in thread)
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    }
    return map
  }, [comments])

  const visibleTopComments = topLevelComments.slice(0, visibleCount)
  const remainingCount = topLevelComments.length - visibleCount

  return (
    <section 
      id="comments" 
      className="mt-12 p-6 sm:p-8 md:p-10 rounded-[28px] border border-black/5 dark:border-white/10 bg-white/75 dark:bg-[#0c0f14]/85 shadow-[0_20px_60px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-2xl transition-all"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-sans text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              Bình luận & Thảo luận
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                {comments.length}
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Để lại ý kiến hoặc trao đổi kỹ thuật chuyên sâu cùng tác giả
            </p>
          </div>
        </div>

        {/* Sort Toggle Filter */}
        {comments.length > 1 && (
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border/40 text-xs">
            <button
              onClick={() => setSortBy("newest")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                sortBy === "newest"
                  ? "bg-background text-foreground shadow-sm border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Mới nhất</span>
            </button>
            <button
              onClick={() => setSortBy("likes")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                sortBy === "likes"
                  ? "bg-background text-foreground shadow-sm border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span>Nhiều tim nhất</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Comment Form */}
      <form onSubmit={handleSubmit} className="mb-10 space-y-4">
        {/* Mode Selector: Named vs Anonymous */}
        <div className="flex flex-wrap items-center gap-2 p-1 rounded-xl bg-muted/50 border border-border/40 w-fit">
          <button
            type="button"
            onClick={() => setIsAnonymous(false)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              !isAnonymous
                ? "bg-background text-foreground shadow-sm border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="w-3.5 h-3.5 text-primary" />
            <span>Bình luận với tên của bạn</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAnonymous(true)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isAnonymous
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Bình luận ẩn danh</span>
          </button>
        </div>

        {/* Author Name Input (if not anonymous) */}
        {!isAnonymous && (
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Nhập tên hoặc biệt danh của bạn (VD: Minh Tuấn, Alex...)"
              maxLength={50}
              className="w-full sm:w-80 px-4 py-2.5 rounded-xl border border-border/50 bg-background/80 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground transition-all"
            />
          </div>
        )}

        {/* Comment Textarea */}
        <div className="relative rounded-2xl border border-border/60 bg-background/90 focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary/50 transition-all overflow-hidden shadow-inner">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              isAnonymous
                ? "Bạn đang bình luận ẩn danh. Nhập nội dung chia sẻ hoặc câu hỏi tại đây..."
                : "Chia sẻ suy nghĩ, góp ý hoặc đặt câu hỏi về bài viết này..."
            }
            rows={3}
            maxLength={1000}
            className="w-full px-4 pt-3.5 pb-12 bg-transparent text-sm resize-none focus:outline-none text-foreground leading-relaxed"
          />

          {/* Quick Emojis & Send Button Bar */}
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between pt-2 border-t border-border/20">
            <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setContent((prev) => prev + emoji)}
                  className="p-1 text-sm hover:scale-125 transition-transform cursor-pointer opacity-80 hover:opacity-100"
                  title={`Chèn ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-md shadow-primary/20 hover:scale-105 active:scale-95 cursor-pointer"
            >
              {submitting ? (
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Gửi bình luận</span>
            </button>
          </div>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div
            className={`flex items-center gap-2 p-3 rounded-xl text-xs font-medium animate-in fade-in duration-200 ${
              statusMsg.type === "success"
                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
            }`}
          >
            {statusMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground pb-2 border-b border-border/30 flex items-center justify-between">
          <span>Danh sách bình luận ({comments.length})</span>
          {topLevelComments.length > 0 && (
            <span className="text-[11px] font-normal normal-case text-muted-foreground">
              Đang hiển thị {Math.min(visibleCount, topLevelComments.length)} / {topLevelComments.length} chủ đề
            </span>
          )}
        </h4>

        {loading ? (
          <div className="py-12 text-center text-sm text-muted-foreground flex items-center justify-center gap-2 animate-pulse">
            <Sparkles className="w-4 h-4 text-primary animate-spin" />
            <span>Đang tải danh sách bình luận...</span>
          </div>
        ) : topLevelComments.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground space-y-2">
            <MessageCircle className="w-10 h-10 mx-auto text-muted-foreground/40 stroke-1" />
            <p className="text-sm font-medium">Chưa có bình luận nào</p>
            <p className="text-xs text-muted-foreground/70">
              Hãy là người đầu tiên để lại ý kiến cho bài viết này!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleTopComments.map((cmt) => {
              const bgGradient = COLOR_MAP[cmt.avatarColor] || COLOR_MAP.emerald
              const initial = (cmt.author || "A").charAt(0).toUpperCase()
              const isLiked = Boolean(likedMap[cmt.id])
              const replies = repliesByParent[cmt.id] || []
              const hasReplies = replies.length > 0
              const isExpanded = Boolean(expandedReplies[cmt.id])
              const isAuthorOwner = cmt.author === "Phan Huỳnh Văn Đô"

              return (
                <div
                  key={cmt.id}
                  className="p-4 sm:p-5 rounded-2xl border border-border/40 bg-background/50 hover:bg-background/80 transition-all shadow-sm space-y-3"
                >
                  {/* Top Bar: Author, Badges, Time */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      {isAuthorOwner || cmt.isAuthor ? (
                        <img
                          src={cmt.avatarUrl || AUTHOR_AVATAR_FALLBACK}
                          alt={cmt.author}
                          className="w-8 h-8 rounded-full object-cover border-2 border-amber-500/60 shadow-sm shrink-0"
                        />
                      ) : (
                        <div
                          className={`w-8 h-8 rounded-full bg-gradient-to-tr ${bgGradient} flex items-center justify-center font-bold text-xs shadow-sm shrink-0`}
                        >
                          {cmt.isAnonymous ? <EyeOff className="w-4 h-4" /> : initial}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">
                          {cmt.author}
                        </span>
                        {(cmt.isAuthor || isAuthorOwner) && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                            ⭐ Tác giả
                          </span>
                        )}
                        {cmt.isAnonymous && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border/40">
                            Ẩn danh
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>{formatRelativeTime(cmt.createdAt)}</span>
                    </div>
                  </div>

                  {/* Comment Content */}
                  <p className="text-sm text-foreground/90 leading-relaxed pl-11">
                    {cmt.content}
                  </p>

                  {/* Action Bar: Thả tim & Trả lời */}
                  <div className="flex items-center gap-4 pl-11 pt-1 text-xs">
                    {/* Heart Button */}
                    <button
                      type="button"
                      onClick={() => handleLikeComment(cmt.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                        isLiked
                          ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                      title={isLiked ? "Bỏ thích" : "Thả tim bình luận này"}
                    >
                      <Heart className={`w-3.5 h-3.5 transition-transform ${isLiked ? "fill-rose-500 text-rose-500 scale-110" : ""}`} />
                      <span>{cmt.likes || 0}</span>
                    </button>

                    {/* Reply Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setReplyToId(replyToId === cmt.id ? null : cmt.id)
                        setReplyAuthorName(authorName)
                      }}
                      className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
                    >
                      <CornerDownRight className="w-3.5 h-3.5 text-primary" />
                      <span>{replyToId === cmt.id ? "Đóng trả lời" : "Trả lời"}</span>
                    </button>

                    {/* Toggle Show Replies Button */}
                    {hasReplies && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedReplies((prev) => ({ ...prev, [cmt.id]: !prev[cmt.id] }))
                        }
                        className="flex items-center gap-1 text-primary hover:text-primary/80 font-medium ml-auto cursor-pointer"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        <span>{isExpanded ? "Thu gọn phản hồi" : `Xem ${replies.length} phản hồi`}</span>
                      </button>
                    )}
                  </div>

                  {/* Inline Reply Form */}
                  {replyToId === cmt.id && (
                    <form
                      onSubmit={(e) => handleReplySubmit(cmt.id, e)}
                      className="mt-3 ml-6 sm:ml-11 p-4 rounded-xl bg-muted/40 border border-border/50 space-y-3 animate-in fade-in zoom-in-95 duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                          <CornerDownRight className="w-3.5 h-3.5 text-primary" />
                          Trả lời cho <strong>{cmt.author}</strong>
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setReplyIsAnonymous(!replyIsAnonymous)}
                            className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition-colors ${
                              replyIsAnonymous
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {replyIsAnonymous ? "Ẩn danh: Bật" : "Bật ẩn danh"}
                          </button>
                        </div>
                      </div>

                      {!replyIsAnonymous && (
                        <input
                          type="text"
                          value={replyAuthorName}
                          onChange={(e) => setReplyAuthorName(e.target.value)}
                          placeholder="Tên của bạn..."
                          maxLength={50}
                          className="w-full sm:w-60 px-3 py-1.5 rounded-lg border border-border/50 bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      )}

                      <div className="relative">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder={`Viết phản hồi cho ${cmt.author}...`}
                          rows={2}
                          maxLength={1000}
                          className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background text-xs resize-none text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setReplyToId(null)}
                          className="px-3 py-1 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          disabled={replySubmitting || !replyContent.trim()}
                          className="inline-flex items-center gap-1 px-3.5 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
                        >
                          {replySubmitting ? <Sparkles className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                          <span>Gửi phản hồi</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Nested Replies Thread (Collapsible) */}
                  {hasReplies && isExpanded && (
                    <div className="mt-3 ml-4 sm:ml-10 space-y-2.5 border-l-2 border-primary/25 pl-3 sm:pl-4 pt-1 animate-in fade-in duration-200">
                      {replies.map((rep) => {
                        const repBg = COLOR_MAP[rep.avatarColor] || COLOR_MAP.indigo
                        const repInitial = (rep.author || "A").charAt(0).toUpperCase()
                        const isRepLiked = Boolean(likedMap[rep.id])
                        const isRepAuthor = rep.author === "Phan Huỳnh Văn Đô"

                        return (
                          <div
                            key={rep.id}
                            className="p-3 sm:p-3.5 rounded-xl border border-border/30 bg-muted/25 hover:bg-muted/40 transition-colors space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                {isRepAuthor || rep.isAuthor ? (
                                  <img
                                    src={rep.avatarUrl || AUTHOR_AVATAR_FALLBACK}
                                    alt={rep.author}
                                    className="w-6 h-6 rounded-full object-cover border border-amber-500/60 shadow-sm shrink-0"
                                  />
                                ) : (
                                  <div
                                    className={`w-6 h-6 rounded-full bg-gradient-to-tr ${repBg} flex items-center justify-center font-bold text-[10px] shadow-sm shrink-0`}
                                  >
                                    {rep.isAnonymous ? <EyeOff className="w-3 h-3" /> : repInitial}
                                  </div>
                                )}
                                <span className="font-semibold text-xs text-foreground">
                                  {rep.author}
                                </span>
                                {(rep.isAuthor || isRepAuthor) && (
                                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                                    ⭐ Tác giả
                                  </span>
                                )}
                                {rep.isAnonymous && (
                                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-medium bg-muted text-muted-foreground">
                                    Ẩn danh
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                {formatRelativeTime(rep.createdAt)}
                              </span>
                            </div>

                            <p className="text-xs text-foreground/90 leading-relaxed pl-8">
                              {rep.content}
                            </p>

                            {/* Reply Heart Button */}
                            <div className="pl-8 pt-0.5">
                              <button
                                type="button"
                                onClick={() => handleLikeComment(rep.id)}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                                  isRepLiked
                                    ? "bg-rose-500/10 text-rose-500"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                <Heart className={`w-3 h-3 ${isRepLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                                <span>{rep.likes || 0}</span>
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Pagination / Load More Bar */}
            {remainingCount > 0 && (
              <div className="pt-4 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-background/80 hover:bg-muted/80 text-foreground text-xs font-semibold shadow-sm transition-all hover:scale-105 cursor-pointer"
                >
                  <ChevronDown className="w-4 h-4 text-primary" />
                  <span>Xem thêm {Math.min(PAGE_SIZE, remainingCount)} bình luận (còn {remainingCount} bình luận)</span>
                </button>
              </div>
            )}

            {visibleCount > PAGE_SIZE && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount(PAGE_SIZE)}
                  className="text-xs text-muted-foreground hover:text-foreground font-medium underline underline-offset-4 cursor-pointer"
                >
                  Thu gọn danh sách về ban đầu
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
