"use client";

import * as React from "react";
import { Loader2, Plus, Pencil, Trash2, FileText, RefreshCw, Eye, EyeOff, Upload, Search, Clock, ArrowUpRight, MoreVertical, Heart, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "./rich-text-editor";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import type { SitePost } from "@/lib/cv/site-data-server";
import { PostEditor } from "./post-editor";
import { TutorialEditor } from "./tutorial-editor";
import { CATEGORIES, POST_LAYOUTS, type PostForm } from "./post-types";

function getEmptyForm(): PostForm {
  return {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    published: true,
    category: "AI",
    layout: "article",
    createdAt: new Date().toISOString(),
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    coverImage: "",
    pdfUrl: "",
  };
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function toForm(p: SitePost): PostForm {
  return {
    title: p.title ?? "",
    slug: p.slug ?? "",
    excerpt: p.excerpt ?? "",
    content: p.content ?? "",
    published: !!p.published,
    category: p.category ?? "AI",
    layout: (p as any).layout ?? "article",
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
    seoTitle: p.seoTitle ?? "",
    seoDescription: p.seoDescription ?? "",
    seoKeywords: p.seoKeywords ?? "",
    coverImage: p.coverImage ?? "",
    pdfUrl: p.pdfUrl ?? "",
  };
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function PostsTab({ locale }: { locale: string }) {
  const { toast } = useToast();
  const [items, setItems] = React.useState<SitePost[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SitePost | null>(null);
  const [form, setForm] = React.useState<PostForm>(getEmptyForm);
  const [submitting, setSubmitting] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [uploadingPdf, setUploadingPdf] = React.useState(false);
  const [extractingPdf, setExtractingPdf] = React.useState(false);
  const [uploadingCoverImage, setUploadingCoverImage] = React.useState(false);
  // Post type state to separate normal posts from PDF uploads
  const [postType, setPostType] = React.useState<"text" | "pdf">("text");
  
  // Filter states
  const [activeCategory, setActiveCategory] = React.useState("Tất cả");
  const [searchQuery, setSearchQuery] = React.useState("");

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/posts?locale=${locale}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data?.message || "Tải thất bại.");
      setItems(data.posts ?? []);
    } catch (err) {
      toast({
        title: "Lỗi",
        description: err instanceof Error ? err.message : "Không tải được bài viết.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    fetchItems();
  }, [locale]);

  function openCreate() {
    setEditing(null);
    setForm(getEmptyForm());
    setPostType("text");
    setSlugTouched(false);
    setDialogOpen(true);
  }

  function openEdit(p: SitePost) {
    setEditing(p);
    setForm(toForm(p));
    setPostType(p.pdfUrl ? "pdf" : "text");
    setSlugTouched(true); // don't auto-overwrite existing slug
    setDialogOpen(true);
  }

  function onTitleChange(title: string) {
    setForm((f) => ({
      ...f,
      title,
      slug: slugTouched ? f.slug : slugify(title),
    }));
  }

  function onSlugChange(slug: string) {
    setSlugTouched(true);
    setForm((f) => ({ ...f, slug }));
  }

  async function handleSubmit(e: React.FormEvent, overridePublished?: boolean) {
    e.preventDefault();
    if (!form.title.trim()) {
      toast({ title: "Thiếu tiêu đề", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const isPublished = overridePublished !== undefined ? overridePublished : form.published;
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || slugify(form.title),
      excerpt: form.excerpt,
      content: form.content,
      published: isPublished,
      category: form.category,
      layout: form.layout,
      locale,
      createdAt: form.createdAt ? new Date(form.createdAt).toISOString() : undefined,
      seoTitle: form.seoTitle.trim(),
      seoDescription: form.seoDescription.trim(),
      seoKeywords: form.seoKeywords.trim(),
      coverImage: form.coverImage.trim(),
      pdfUrl: form.pdfUrl,
    };
    try {
      const url = editing ? `/api/admin/posts/${editing.id}` : "/api/admin/posts";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data?.message || "Lưu thất bại.");
      toast({
        title: editing ? "Đã cập nhật bài viết" : "Đã tạo bài viết",
        description: payload.title,
      });
      setDialogOpen(false);
      await fetchItems();
    } catch (err) {
      toast({
        title: "Lỗi",
        description: err instanceof Error ? err.message : "Lưu thất bại.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/posts/${deleteId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data?.message || "Xóa thất bại.");
      toast({ title: "Đã xóa bài viết" });
      setDeleteId(null);
      await fetchItems();
    } catch (err) {
      toast({
        title: "Lỗi",
        description: err instanceof Error ? err.message : "Xóa thất bại.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  }

  const filteredItems = React.useMemo(() => {
    return items.filter(post => {
      const matchesSearch = post.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "Tất cả" || post.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, activeCategory]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="mt-2 flex flex-col xl:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          <Button 
            variant="default" 
            onClick={() => setActiveCategory("Tất cả")}
            className={`rounded-full h-8 px-4 text-xs font-medium border-none ${activeCategory === "Tất cả" ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'bg-transparent text-muted-foreground hover:bg-white/5'}`}
          >
            Tất cả
          </Button>
          {CATEGORIES.map((cat, i) => (
            <Button 
              key={i} 
              variant="outline" 
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full h-8 px-4 text-xs font-medium border-border/40 transition-colors ${activeCategory === cat ? 'bg-primary/20 text-primary border-primary/30' : 'bg-transparent text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground dark:hover:text-white'}`}
            >
              {cat}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-end">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm bài viết..." 
              className="w-full pl-9 h-8 rounded-md border-border/40 bg-transparent text-xs focus-visible:ring-1 focus-visible:ring-primary/20"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="h-8 rounded-md border-border/40 hover:bg-black/5 dark:hover:bg-white/5 bg-transparent text-xs px-3 text-muted-foreground hover:text-foreground dark:hover:text-white transition-colors" onClick={fetchItems} disabled={loading}>
              <RefreshCw className={`size-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Tải lại
            </Button>
            <Button className="h-8 rounded-md text-xs px-3" onClick={openCreate}>
              <Plus className="size-3.5 mr-1.5" /> Viết bài mới
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-[1.2rem]" />
            ))}
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <FileText className="size-10 text-muted-foreground" />
            <div>
              <p className="font-medium">Chưa có bài viết</p>
              <p className="text-sm text-muted-foreground">Bắt đầu viết bài đầu tiên.</p>
            </div>
            <Button size="sm" onClick={openCreate}>
              <Plus className="size-4" /> Viết bài mới
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((post, i) => {
            const postCategory = post.category || CATEGORIES[0]
            const wordCount = (post.content || "").replace(/<[^>]*>?/gm, "").trim().split(/\s+/).filter(Boolean).length
            const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200))
            const readTimeText = `${readTimeMinutes} phút đọc`
            const viewCountText = (post.views || 0) >= 1000 ? `${((post.views || 0) / 1000).toFixed(1)}K` : `${post.views || 0}`

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: (i % 3) * 0.06 }}
                className="h-full"
              >
                <Card className="group h-full flex flex-col overflow-hidden border-border/20 bg-white dark:bg-[#0d120f] hover:border-primary/30 transition-all duration-300 rounded-[1.2rem] relative shadow-lg shadow-black/5 dark:shadow-black/20">
                  
                  {/* Image Placeholder or Cover Image */}
                  <div className="h-44 w-full bg-gradient-to-br from-gray-100 to-gray-50 dark:from-[#121c17] dark:to-[#0a0d0b] flex items-center justify-center relative overflow-hidden border-b border-border/10 dark:border-white/5">
                    {post.coverImage ? (
                      <>
                        <img src={post.coverImage} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/10 dark:bg-black/40 group-hover:bg-black/5 dark:group-hover:bg-black/20 transition-colors duration-500"></div>
                      </>
                    ) : (
                      <>
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent"></div>
                        <span className="text-7xl font-bold text-primary/10 font-serif group-hover:scale-110 transition-transform duration-500">Z</span>
                      </>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      {post.published ? (
                        <Badge variant="outline" className="bg-white/90 dark:bg-[#0f1712]/90 border-primary/30 text-primary text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full backdrop-blur-md flex items-center gap-1">
                          <Eye className="w-3 h-3" /> Đã đăng
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100/90 dark:bg-black/60 border-border/20 dark:border-white/10 text-gray-700 dark:text-white/70 text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full backdrop-blur-md flex items-center gap-1">
                          <EyeOff className="w-3 h-3" /> Bản nháp
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1 bg-gradient-to-b from-white to-gray-50 dark:from-[#111713] dark:to-[#0a0d0b]">
                    <div className="flex items-start justify-between mb-4">
                      {/* Category & Layout Badges */}
                      <div className="flex items-center gap-1.5">
                        <Badge className="bg-primary/90 hover:bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-sm w-fit uppercase shadow-md shadow-primary/20">
                          {postCategory}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm border-border/30 text-muted-foreground">
                          {(POST_LAYOUTS.find(l => l.id === ((post as any).layout ?? "article"))?.icon ?? "📄")}{" "}
                          {POST_LAYOUTS.find(l => l.id === ((post as any).layout ?? "article"))?.label ?? "Bài viết"}
                        </Badge>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-black/5 dark:hover:bg-white/10 -mr-2">
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32 bg-white dark:bg-[#0d120f] border-border/20">
                          <DropdownMenuItem onClick={() => openEdit(post)} className="cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4" /> Sửa bài
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteId(post.id)} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Xóa bài
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white/90 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h3>
                    <p className="mt-2.5 text-[13px] text-muted-foreground leading-relaxed line-clamp-2 flex-1">
                      {post.excerpt || "Không có mô tả."}
                    </p>

                    {/* Footer Stats */}
                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/10 dark:border-white/5">
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-1" title="Thời gian đọc ước tính">
                          <Clock className="w-3.5 h-3.5" /> {readTimeText}
                        </div>
                        <div className="flex items-center gap-1 text-sky-500/90" title="Lượt xem">
                          <Eye className="w-3.5 h-3.5" /> {viewCountText}
                        </div>
                        <div className="flex items-center gap-1 text-rose-500/90" title="Lượt thích">
                          <Heart className="w-3.5 h-3.5" /> {(post as any).likes || 0}
                        </div>
                        <div className="flex items-center gap-1 text-amber-500/90" title="Lượt lưu">
                          <Bookmark className="w-3.5 h-3.5" /> {(post as any).bookmarks || 0}
                        </div>
                      </div>
                      <a 
                        href={`/posts/${post.slug}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center justify-center w-7 h-7 rounded-full border border-border/20 dark:border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-colors"
                        title="Xem bài viết trên web"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
                      </a>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {dialogOpen && (
        form.layout === 'tutorial' ? (
          <TutorialEditor
            form={form}
            setForm={setForm}
            editing={editing}
            submitting={submitting}
            onSubmit={handleSubmit}
            onClose={() => setDialogOpen(false)}
            onTitleChange={onTitleChange}
            onSlugChange={onSlugChange}
          />
        ) : (
          <PostEditor
            form={form}
            setForm={setForm}
            editing={editing}
            submitting={submitting}
            onSubmit={handleSubmit}
            onClose={() => setDialogOpen(false)}
            onTitleChange={onTitleChange}
            onSlugChange={onSlugChange}
            slugify={slugify}
          />
        )
      )}


      <AlertDialog open={!!deleteId} onOpenChange={(o) => !deleting && !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bài viết này?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động không thể hoàn tác. Bài viết sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
