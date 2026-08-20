"use client";

import * as React from "react";
import {
  MessageSquare,
  MessageCircle,
  CornerDownRight,
  Trash2,
  Send,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  Heart,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  EyeOff,
  User,
  ShieldCheck,
  Flame,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SiteProfile } from "@/lib/cv/site-data-server";

export type AdminComment = {
  id: string;
  postSlug: string;
  parentId: string | null;
  author: string;
  isAnonymous: boolean;
  isAuthor: boolean;
  avatarUrl: string | null;
  content: string;
  avatarColor: string;
  likes: number;
  createdAt: string;
};

type PostMeta = {
  slug: string;
  title: string;
  category: string;
};

type CommentStats = {
  totalComments: number;
  totalTopLevel: number;
  totalReplies: number;
  totalLikes: number;
  postStats: Record<string, { title: string; count: number; replyCount: number; lastActivity: string | null }>;
};

const COLOR_MAP: Record<string, string> = {
  emerald: "from-emerald-500 to-teal-600 text-white",
  indigo: "from-indigo-500 to-blue-600 text-white",
  rose: "from-rose-500 to-pink-600 text-white",
  amber: "from-amber-500 to-orange-600 text-white",
  sky: "from-sky-500 to-cyan-600 text-white",
  purple: "from-purple-500 to-violet-600 text-white",
  teal: "from-teal-500 to-emerald-600 text-white",
  pink: "from-pink-500 to-rose-600 text-white",
};

function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export function CommentsTab({
  locale,
  profile,
}: {
  locale: string;
  profile: SiteProfile | null;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [comments, setComments] = React.useState<AdminComment[]>([]);
  const [posts, setPosts] = React.useState<PostMeta[]>([]);
  const [stats, setStats] = React.useState<CommentStats | null>(null);

  // Filters
  const [selectedSlug, setSelectedSlug] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // Reply Dialog State
  const [replyingComment, setReplyingComment] = React.useState<AdminComment | null>(null);
  const [replyContent, setReplyContent] = React.useState<string>("");
  const [replySubmitting, setReplySubmitting] = React.useState(false);

  // Delete State
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const fetchComments = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/comments", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.ok) {
        setComments(data.comments || []);
        setPosts(data.posts || []);
        setStats(data.stats || null);
      } else {
        toast({
          title: "Lỗi tải dữ liệu",
          description: data.message || "Không thể tải danh sách bình luận",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Lỗi kết nối",
        description: "Không thể kết nối đến máy chủ",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Handle Reply submission
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingComment || !replyContent.trim()) return;

    setReplySubmitting(true);
    try {
      const res = await fetch("/api/admin/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reply",
          postSlug: replyingComment.postSlug,
          parentId: replyingComment.id,
          content: replyContent.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        toast({
          title: "Thành công",
          description: "Đã đăng câu trả lời với tư cách Tác giả!",
        });
        setReplyingComment(null);
        setReplyContent("");
        fetchComments();
      } else {
        toast({
          title: "Lỗi gửi phản hồi",
          description: data.message || "Không thể gửi câu trả lời.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi kết nối.",
        variant: "destructive",
      });
    } finally {
      setReplySubmitting(false);
    }
  };

  // Handle Delete comment
  const handleDeleteComment = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bình luận này và tất cả các phản hồi liên quan không?")) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        toast({
          title: "Đã xóa",
          description: "Bình luận đã được xóa khỏi hệ thống.",
        });
        fetchComments();
      } else {
        toast({
          title: "Lỗi xóa bình luận",
          description: data.message || "Không thể xóa bình luận.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi xóa.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered comments
  const filteredComments = React.useMemo(() => {
    return comments.filter((c) => {
      if (selectedSlug !== "all" && c.postSlug !== selectedSlug) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.author.toLowerCase().includes(q) ||
          c.content.toLowerCase().includes(q) ||
          c.postSlug.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [comments, selectedSlug, searchQuery]);

  // Group top-level vs replies
  const topLevel = filteredComments.filter((c) => !c.parentId);
  const repliesMap: Record<string, AdminComment[]> = {};
  for (const c of filteredComments) {
    if (c.parentId) {
      if (!repliesMap[c.parentId]) repliesMap[c.parentId] = [];
      repliesMap[c.parentId].push(c);
    }
  }

  const authorName = profile?.name || "Phan Huỳnh Văn Đô";
  const authorAvatar = profile?.avatar || "";

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-primary" />
            Quản lý Bình luận
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Thống kê tương tác, kiểm duyệt và trả lời các thảo luận của độc giả với tư cách Tác giả
          </p>
        </div>

        <button
          onClick={fetchComments}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/60 hover:bg-muted border border-border/50 text-xs font-semibold text-foreground transition-all cursor-pointer shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
          <span>Tải lại dữ liệu</span>
        </button>
      </div>

      {/* Top Stat Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-border/50 bg-card/60 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Tổng bình luận</span>
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <p className="text-3xl font-extrabold text-foreground font-mono">{stats.totalComments}</p>
          </div>

          <div className="p-5 rounded-2xl border border-border/50 bg-card/60 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Chủ đề thảo luận</span>
              <MessageCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-3xl font-extrabold text-foreground font-mono">{stats.totalTopLevel}</p>
          </div>

          <div className="p-5 rounded-2xl border border-border/50 bg-card/60 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Phản hồi (Replies)</span>
              <CornerDownRight className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-3xl font-extrabold text-foreground font-mono">{stats.totalReplies}</p>
          </div>

          <div className="p-5 rounded-2xl border border-border/50 bg-card/60 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Tổng lượt thích</span>
              <Heart className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-3xl font-extrabold text-foreground font-mono">{stats.totalLikes}</p>
          </div>
        </div>
      )}

      {/* Post Statistics Overview Table */}
      {stats && Object.keys(stats.postStats).length > 0 && (
        <div className="p-6 rounded-2xl border border-border/50 bg-card/40 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Thống kê bình luận theo bài viết
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/40 text-muted-foreground">
                  <th className="py-2.5 px-3 font-semibold">Tên bài viết</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Bình luận</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Phản hồi</th>
                  <th className="py-2.5 px-3 font-semibold">Hoạt động gần nhất</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {Object.entries(stats.postStats).map(([slug, data]) => (
                  <tr key={slug} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-3 font-medium text-foreground max-w-md truncate">
                      {data.title || slug}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-foreground">
                      {data.count}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-muted-foreground">
                      {data.replyCount}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground font-mono">
                      {data.lastActivity ? formatTime(data.lastActivity) : "Chưa có"}
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <button
                        onClick={() => setSelectedSlug(slug)}
                        className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-medium transition-colors cursor-pointer"
                      >
                        Lọc bài này
                      </button>
                      <a
                        href={`/posts/${slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-muted-foreground hover:text-foreground font-medium transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-border/50 bg-card/60 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Post Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">Tất cả bài viết ({comments.length})</option>
              {posts.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {selectedSlug !== "all" && (
            <button
              onClick={() => setSelectedSlug("all")}
              className="text-xs text-primary hover:underline"
            >
              Xóa bộ lọc bài viết
            </button>
          )}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tác giả, nội dung..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-sm text-muted-foreground flex items-center justify-center gap-2 animate-pulse">
            <Sparkles className="w-4 h-4 text-primary animate-spin" />
            <span>Đang tải bình luận...</span>
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground space-y-2 rounded-2xl border border-border/40 bg-card/20">
            <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground/30 stroke-1" />
            <p className="text-sm font-medium">Không tìm thấy bình luận nào</p>
            <p className="text-xs text-muted-foreground/70">
              {searchQuery ? "Hãy thử thay đổi từ khóa tìm kiếm." : "Chưa có bình luận nào trong mục đã chọn."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {topLevel.map((cmt) => {
              const bgGradient = COLOR_MAP[cmt.avatarColor] || COLOR_MAP.emerald;
              const initial = (cmt.author || "A").charAt(0).toUpperCase();
              const replies = repliesMap[cmt.id] || [];

              return (
                <div
                  key={cmt.id}
                  className="p-5 rounded-2xl border border-border/50 bg-card/60 shadow-sm space-y-3 transition-all hover:border-primary/30"
                >
                  {/* Top: Author, Meta & Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      {cmt.isAuthor && cmt.avatarUrl ? (
                        <img
                          src={cmt.avatarUrl}
                          alt={cmt.author}
                          className="w-8 h-8 rounded-full object-cover border-2 border-amber-500/50 shadow-sm shrink-0"
                        />
                      ) : (
                        <div
                          className={`w-8 h-8 rounded-full bg-gradient-to-tr ${bgGradient} flex items-center justify-center font-bold text-xs shadow-sm shrink-0`}
                        >
                          {cmt.isAnonymous ? <EyeOff className="w-4 h-4" /> : initial}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">{cmt.author}</span>
                        {cmt.isAuthor && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                            ⭐ Tác giả (Admin)
                          </span>
                        )}
                        {cmt.isAnonymous && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border/40">
                            Ẩn danh
                          </span>
                        )}
                        <span className="text-[11px] font-mono text-muted-foreground">
                          · {formatTime(cmt.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs text-rose-500 font-mono font-medium px-2 py-0.5 rounded bg-rose-500/10">
                        <Heart className="w-3 h-3 fill-rose-500" /> {cmt.likes || 0}
                      </span>
                      <button
                        onClick={() => handleDeleteComment(cmt.id)}
                        disabled={deletingId === cmt.id}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Xóa bình luận này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Post reference badge */}
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5 pl-11">
                    <span>Bài viết:</span>
                    <a
                      href={`/posts/${cmt.postSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                    >
                      {cmt.postSlug} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Content */}
                  <div className="pl-11 text-sm text-foreground/90 leading-relaxed bg-muted/20 p-3 rounded-xl border border-border/20">
                    {cmt.content}
                  </div>

                  {/* Action: Reply button */}
                  <div className="pl-11 pt-1 flex items-center gap-3">
                    <button
                      onClick={() => setReplyingComment(cmt)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 border border-primary/25 transition-all cursor-pointer"
                    >
                      <CornerDownRight className="w-3.5 h-3.5" />
                      <span>Trả lời với tư cách Tác giả</span>
                    </button>
                  </div>

                  {/* Nested Replies List */}
                  {replies.length > 0 && (
                    <div className="mt-3 ml-6 sm:ml-11 space-y-2.5 border-l-2 border-primary/30 pl-4 pt-2">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Phản hồi ({replies.length})
                      </div>
                      {replies.map((rep) => {
                        const repBg = COLOR_MAP[rep.avatarColor] || COLOR_MAP.indigo;
                        const repInitial = (rep.author || "A").charAt(0).toUpperCase();

                        return (
                          <div
                            key={rep.id}
                            className={`p-3.5 rounded-xl border transition-colors space-y-2 ${
                              rep.isAuthor
                                ? "bg-primary/5 border-primary/30"
                                : "bg-muted/30 border-border/30"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                {rep.isAuthor && rep.avatarUrl ? (
                                  <img
                                    src={rep.avatarUrl}
                                    alt={rep.author}
                                    className="w-6 h-6 rounded-full object-cover border border-amber-500/50 shadow-sm shrink-0"
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
                                {rep.isAuthor && (
                                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                                    ⭐ Tác giả
                                  </span>
                                )}
                                {rep.isAnonymous && (
                                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-medium bg-muted text-muted-foreground">
                                    Ẩn danh
                                  </span>
                                )}
                                <span className="text-[10px] text-muted-foreground font-mono">
                                  · {formatTime(rep.createdAt)}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 text-[11px] text-rose-500 font-mono">
                                  <Heart className="w-3 h-3 fill-rose-500" /> {rep.likes || 0}
                                </span>
                                <button
                                  onClick={() => handleDeleteComment(rep.id)}
                                  disabled={deletingId === rep.id}
                                  className="p-1 rounded text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
                                  title="Xóa phản hồi này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <p className="text-xs text-foreground/90 leading-relaxed pl-8">
                              {rep.content}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reply Modal Dialog */}
      {replyingComment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-3xl border border-border/60 bg-background p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <CornerDownRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">
                    Trả lời bình luận của {replyingComment.author}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Bài viết: {replyingComment.postSlug}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setReplyingComment(null)}
                className="text-muted-foreground hover:text-foreground text-xs font-semibold p-1"
              >
                ✕
              </button>
            </div>

            {/* Quoted Comment */}
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/30 text-xs text-muted-foreground italic leading-relaxed">
              &quot;{replyingComment.content}&quot;
            </div>

            {/* Author Profile Preview */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
              {authorAvatar ? (
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-primary/50 shadow-sm"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-sm text-primary">
                  {authorName.charAt(0)}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-foreground">{authorName}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                    ⭐ Tác giả
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Phản hồi chính thức sẽ hiển thị tên và ảnh đại diện của bạn
                </p>
              </div>
            </div>

            {/* Textarea Form */}
            <form onSubmit={handleSendReply} className="space-y-4">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Nhập nội dung phản hồi chính thức của bạn..."
                rows={4}
                required
                maxLength={1000}
                className="w-full p-4 rounded-2xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed resize-none shadow-inner"
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReplyingComment(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={replySubmitting || !replyContent.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all shadow-md shadow-primary/20 cursor-pointer"
                >
                  {replySubmitting ? (
                    <Sparkles className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Đăng câu trả lời</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
