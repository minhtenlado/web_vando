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
  MessageCircle
} from "lucide-react"

type CommentItem = {
  id: string
  postSlug: string
  author: string
  isAnonymous: boolean
  content: string
  avatarColor: string
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
  
  // Form State
  const [isAnonymous, setIsAnonymous] = React.useState(false)
  const [authorName, setAuthorName] = React.useState("")
  const [content, setContent] = React.useState("")
  const [statusMsg, setStatusMsg] = React.useState<{ text: string; type: "success" | "error" } | null>(null)

  // Fetch comments
  const fetchComments = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/posts/${slug}/comments`, { cache: "no-store" })
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
  }, [fetchComments])

  // Submit comment
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

  const addEmoji = (emoji: string) => {
    setContent((prev) => prev + emoji)
  }

  return (
    <section 
      id="comments" 
      className="mt-12 p-6 sm:p-8 rounded-[24px] border border-black/5 dark:border-white/10 bg-white/70 dark:bg-[#0e1217]/80 shadow-[0_20px_60px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-sans text-xl font-bold text-foreground flex items-center gap-2">
              Bình luận & Thảo luận
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                {comments.length}
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Để lại ý kiến hoặc thảo luận kỹ thuật cùng tác giả
            </p>
          </div>
        </div>
      </div>

      {/* Comment Form */}
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
                  onClick={() => addEmoji(emoji)}
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
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground pb-2 border-b border-border/30">
          Danh sách bình luận ({comments.length})
        </h4>

        {loading ? (
          <div className="py-10 text-center text-sm text-muted-foreground flex items-center justify-center gap-2 animate-pulse">
            <Sparkles className="w-4 h-4 text-primary animate-spin" />
            <span>Đang tải bình luận...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground space-y-2">
            <MessageCircle className="w-10 h-10 mx-auto text-muted-foreground/40 stroke-1" />
            <p className="text-sm font-medium">Chưa có bình luận nào</p>
            <p className="text-xs text-muted-foreground/70">
              Hãy là người đầu tiên để lại ý kiến cho bài viết này!
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {comments.map((cmt) => {
              const bgGradient = COLOR_MAP[cmt.avatarColor] || COLOR_MAP.emerald
              const initial = (cmt.author || "A").charAt(0).toUpperCase()

              return (
                <div
                  key={cmt.id}
                  className="p-4 sm:p-5 rounded-2xl border border-border/40 bg-background/50 hover:bg-background/80 transition-colors shadow-sm space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div
                        className={`w-8 h-8 rounded-full bg-gradient-to-tr ${bgGradient} flex items-center justify-center font-bold text-xs shadow-sm`}
                      >
                        {cmt.isAnonymous ? <EyeOff className="w-4 h-4" /> : initial}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground">
                            {cmt.author}
                          </span>
                          {cmt.isAnonymous && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border/40">
                              Ẩn danh
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{formatRelativeTime(cmt.createdAt)}</span>
                    </div>
                  </div>

                  <p className="text-sm text-foreground/90 leading-relaxed pl-11">
                    {cmt.content}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
