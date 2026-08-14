"use client";

import * as React from "react";
import { Loader2, Plus, Pencil, Trash2, FileText, RefreshCw, Eye, EyeOff, Upload, Search, Clock, ArrowUpRight, MoreVertical } from "lucide-react";
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

type PostForm = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published: boolean;
  category: string;
  createdAt: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  coverImage: string;
  pdfUrl: string;
};

function getEmptyForm(): PostForm {
  return {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    published: false,
    category: "",
    createdAt: new Date().toISOString().slice(0, 10),
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    coverImage: "",
    pdfUrl: "",
  };
}

function slugify(s: string): string {
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
    category: p.category ?? "",
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      toast({ title: "Thiếu tiêu đề", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || slugify(form.title),
      excerpt: form.excerpt,
      content: form.content,
      published: form.published,
      category: form.category,
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

  const CATEGORIES = ["AI", "embedded", "IOT", "Robot", "ROS2"]

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
          {CATEGORIES.map(cat => (
            <Button 
              key={cat} 
              variant="outline" 
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full h-8 px-4 text-xs font-medium border-border/40 hover:bg-white/5 ${activeCategory === cat ? 'bg-primary/20 text-primary border-primary/30' : 'bg-transparent text-muted-foreground'}`}
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
            <Button variant="outline" className="h-8 rounded-md border-border/40 hover:bg-white/5 bg-transparent text-xs px-3 text-muted-foreground" onClick={fetchItems} disabled={loading}>
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
      ) : items.length === 0 ? (
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
          {items.map((post, i) => {
            const postCategory = post.category || CATEGORIES[0]
            const mockReadTime = `${Math.floor(Math.random() * 10) + 1} phút đọc`
            const mockViews = `${(Math.random() * 20).toFixed(1)}K`

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: (i % 3) * 0.06 }}
                className="h-full"
              >
                <Card className="group h-full flex flex-col overflow-hidden border-border/20 bg-[#0d120f] hover:border-primary/30 transition-all duration-300 rounded-[1.2rem] relative shadow-lg shadow-black/20">
                  
                  {/* Image Placeholder or Cover Image */}
                  <div className="h-44 w-full bg-gradient-to-br from-[#121c17] to-[#0a0d0b] flex items-center justify-center relative overflow-hidden border-b border-white/5">
                    {post.coverImage ? (
                      <>
                        <img src={post.coverImage} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500"></div>
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
                        <Badge variant="outline" className="bg-[#0f1712]/90 border-primary/30 text-primary text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full backdrop-blur-md flex items-center gap-1">
                          <Eye className="w-3 h-3" /> Đã đăng
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-black/60 border-white/10 text-white/70 text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full backdrop-blur-md flex items-center gap-1">
                          <EyeOff className="w-3 h-3" /> Bản nháp
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1 bg-gradient-to-b from-[#111713] to-[#0a0d0b]">
                    <div className="flex items-start justify-between mb-4">
                      {/* Category Badge */}
                      <Badge className="bg-primary/90 hover:bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-sm w-fit uppercase shadow-md shadow-primary/20">
                        {postCategory}
                      </Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-white/10 -mr-2">
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32 bg-[#0d120f] border-border/20">
                          <DropdownMenuItem onClick={() => openEdit(post)} className="cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4" /> Sửa bài
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteId(post.id)} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Xóa bài
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <h3 className="text-base sm:text-lg font-semibold text-white/90 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h3>
                    <p className="mt-2.5 text-[13px] text-muted-foreground/80 leading-relaxed line-clamp-2 flex-1">
                      {post.excerpt || "Không có mô tả."}
                    </p>

                    {/* Footer Stats */}
                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground/70">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> {mockReadTime}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5" /> {mockViews}
                        </div>
                      </div>
                      <a href={`/posts/${post.slug}`} target="_blank" rel="noreferrer" className="flex items-center justify-center w-6 h-6 rounded-full border border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-colors">
                        <ArrowUpRight className="w-3 h-3 text-muted-foreground/70 group-hover:text-primary" />
                      </a>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(o) => !submitting && setDialogOpen(o)}>
        <DialogContent className="w-full h-full max-w-full lg:max-w-[95vw] lg:h-[95vh] flex flex-col overflow-hidden p-0 rounded-none lg:rounded-xl">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col">
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa bài viết" : "Viết bài mới"}</DialogTitle>
            <DialogDescription>
              Hỗ trợ Markdown: <code className="font-mono">## tiêu đề</code>, <code className="font-mono">**bold**</code>, <code className="font-mono">```code```</code>, <code className="font-mono">- list</code>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="font-mono text-xs">Tiêu đề *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  placeholder="Hành trình học embedded…"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-mono text-xs">Slug (tự động nếu để trống)</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => onSlugChange(e.target.value)}
                  placeholder="hanh-trinh-hoc-embedded"
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  {form.slug ? `Sẽ lưu: /${slugify(form.slug)}` : "Sinh tự động từ tiêu đề (bỏ dấu, đ→d)."}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="font-mono text-xs">Chủ đề (Category)</Label>
                <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn chủ đề" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="font-mono text-xs">Ngày đăng bài</Label>
                <Input
                  type="date"
                  value={form.createdAt}
                  onChange={(e) => setForm({ ...form, createdAt: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-mono text-xs">Ảnh bìa (Cover Image URL)</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={form.coverImage}
                  onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                  placeholder="https://..."
                  className="flex-1"
                />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  id="cover-upload" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingCoverImage(true);
                    try {
                      const fd = new FormData();
                      fd.append("file", file);
                      const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
                      const data = await res.json().catch(() => ({}));
                      if (!res.ok || !data.ok) throw new Error(data?.message || "Upload thất bại.");
                      setForm(f => ({ ...f, coverImage: data.url }));
                      toast({ title: "Đã tải lên ảnh bìa" });
                    } catch (err) {
                      toast({ title: "Lỗi tải ảnh", description: err instanceof Error ? err.message : "Upload thất bại.", variant: "destructive" });
                    } finally {
                      setUploadingCoverImage(false);
                      e.target.value = ""; // reset input
                    }
                  }} 
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  className="shrink-0"
                  onClick={() => document.getElementById("cover-upload")?.click()}
                  disabled={uploadingCoverImage}
                >
                  {uploadingCoverImage ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-mono text-xs">Tóm tắt (excerpt)</Label>
              <Textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                rows={3}
                placeholder="Mô tả ngắn về bài viết…"
              />
            </div>

            <div className="space-y-3 flex-1 flex flex-col min-h-0 pt-2 border-t mt-4">
              <Label className="font-mono text-xs">Loại bài viết</Label>
              <Tabs
                value={postType}
                onValueChange={(val) => {
                  const type = val as "text" | "pdf";
                  setPostType(type);
                  // Auto clear the inactive field so they don't clash
                  if (type === "text") {
                    setForm((f) => ({ ...f, pdfUrl: "" }));
                  } else {
                    setForm((f) => ({ ...f, content: "" }));
                  }
                }}
                className="flex-1 flex flex-col min-h-0"
              >
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                  <TabsTrigger value="text">Tạo bài viết</TabsTrigger>
                  <TabsTrigger value="pdf">Tải bài viết lên (PDF)</TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="flex-1 flex flex-col min-h-0 mt-4 data-[state=inactive]:hidden">
                  <div className="flex-1 min-h-[300px]">
                    <RichTextEditor
                      value={form.content}
                      onChange={(val) => setForm({ ...form, content: val })}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="pdf" className="mt-4 data-[state=inactive]:hidden">
                  <div className="space-y-4 border rounded-xl p-6 bg-muted/10 text-center flex flex-col items-center justify-center min-h-[200px]">
                    <FileText className="size-10 text-muted-foreground mb-2" />
                    <Label className="block text-sm">Tải lên File PDF thay thế nội dung</Label>
                    <p className="text-xs text-muted-foreground max-w-sm mb-4">
                      Khi bài viết ở định dạng PDF, trang web sẽ hiển thị trực tiếp trình xem PDF chuyên nghiệp và ẩn phần tiêu đề.
                    </p>
                    <div className="flex items-center gap-3">
                      <Input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        id="pdf-upload"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingPdf(true);
                          try {
                            const fd = new FormData();
                            fd.append("file", file);
                            const res = await fetch("/api/admin/upload-file", { method: "POST", body: fd });
                            const data = await res.json();
                            if (data.ok) {
                              setForm((f) => ({ ...f, pdfUrl: data.url, content: "" }));
                            } else {
                              toast({ title: "Lỗi tải PDF", description: data.message, variant: "destructive" });
                            }
                          } catch {
                            toast({ title: "Lỗi tải PDF", variant: "destructive" });
                          } finally {
                            setUploadingPdf(false);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="default"
                        onClick={() => document.getElementById("pdf-upload")?.click()}
                        disabled={uploadingPdf}
                      >
                        {uploadingPdf ? <Loader2 className="size-4 animate-spin mr-2" /> : <Plus className="size-4 mr-2" />}
                        {uploadingPdf ? "Đang tải..." : "Chọn file PDF"}
                      </Button>
                    </div>

                    {form.pdfUrl && (
                      <div className="flex flex-col gap-3 mt-4 max-w-full bg-blue-50/30 p-4 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-blue-600 truncate font-mono bg-blue-50/80 p-2 px-3 rounded-full border border-blue-200">
                            Đã đính kèm: {form.pdfUrl.split('/').pop()}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10 shrink-0 rounded-full h-8 w-8"
                            onClick={() => setForm((f) => ({ ...f, pdfUrl: "" }))}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                        
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-fit text-blue-700 border-blue-300 bg-blue-100 hover:bg-blue-200"
                          onClick={async () => {
                            try {
                              setExtractingPdf(true);

                              const res = await fetch('/api/admin/extract-pdf', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ url: form.pdfUrl })
                              });
                              if (!res.ok) {
                                const errData = await res.json().catch(() => ({}));
                                throw new Error(errData.error || 'Trích xuất thất bại');
                              }
                              const data = await res.json();
                              setForm(f => ({ ...f, content: data.text }));
                              
                              // Force switch to Text mode so user can see it
                              setPostType("text");
                              toast({ title: "Thành công", description: "Đã trích xuất văn bản từ PDF chuẩn SEO!" });
                            } catch (e: any) {

                              toast({ variant: "destructive", title: "Lỗi", description: e.message });
                            } finally {
                              setExtractingPdf(false);
                            }
                          }}
                          disabled={extractingPdf}
                        >
                          {extractingPdf ? <Loader2 className="size-4 animate-spin mr-2" /> : <FileText className="size-4 mr-2" />}
                          {extractingPdf ? "Đang xử lý PDF..." : "Trích xuất Text cho SEO (Mô phỏng StuDocu)"}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1">
                          *Hệ thống sẽ bóc tách toàn bộ chữ trong PDF và điền vào ô Nội dung. Bạn nên dọn dẹp lại Text cho đẹp mắt rồi mới lưu.
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>


            <div className="space-y-4 border rounded-xl p-4 bg-muted/20 mt-4">
              <h3 className="font-semibold text-sm">Cấu hình SEO</h3>

              {/* Google Preview */}
              <div className="rounded-lg border border-border/60 bg-background p-4 space-y-1">
                <p className="text-xs text-muted-foreground font-mono mb-2">🔍 Xem trước trên Google</p>
                <p className="text-blue-600 dark:text-blue-400 text-base font-medium leading-snug truncate">
                  {(form.seoTitle || form.title || "Tiêu đề bài viết").slice(0, 60)}
                  {(form.seoTitle || form.title || "").length > 60 ? "..." : ""} — Phan Huỳnh Văn Đô
                </p>
                <p className="text-green-700 dark:text-green-500 text-xs font-mono">
                  phanhuynh.id.vn › posts › {form.slug || "bai-viet"}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {(form.seoDescription || form.excerpt || "Mô tả sẽ hiển thị ở đây...").slice(0, 160)}
                  {(form.seoDescription || form.excerpt || "").length > 160 ? "..." : ""}
                </p>
              </div>

              {/* SEO Title */}
              <div className="space-y-1.5">
                <Label className="font-mono text-xs">Tiêu đề SEO (tùy chọn)</Label>
                <Input
                  value={form.seoTitle}
                  onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                  placeholder="Tiêu đề hiển thị trên Google..."
                  maxLength={300}
                />
                <div className="flex items-center justify-between">
                  <p className={`text-xs ${
                    form.seoTitle.length === 0 ? "text-muted-foreground" :
                    form.seoTitle.length < 30 ? "text-yellow-500" :
                    form.seoTitle.length <= 60 ? "text-green-500" :
                    "text-red-500"
                  }`}>
                    {form.seoTitle.length === 0 ? "💡 Nên có 30–60 ký tự để tối ưu" :
                     form.seoTitle.length < 30 ? `⚠️ Quá ngắn — cần thêm ${30 - form.seoTitle.length} ký tự nữa` :
                     form.seoTitle.length <= 60 ? "✅ Độ dài tối ưu!" :
                     `❌ Quá dài ${form.seoTitle.length - 60} ký tự — Google sẽ cắt bớt`}
                  </p>
                  <span className={`text-xs font-mono ${
                    form.seoTitle.length === 0 ? "text-muted-foreground" :
                    form.seoTitle.length >= 30 && form.seoTitle.length <= 60 ? "text-green-500" :
                    form.seoTitle.length > 60 ? "text-red-500" : "text-yellow-500"
                  }`}>{form.seoTitle.length}/60</span>
                </div>
              </div>

              {/* SEO Description */}
              <div className="space-y-1.5">
                <Label className="font-mono text-xs">Mô tả SEO (Meta Description)</Label>
                <Textarea
                  value={form.seoDescription}
                  onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                  rows={2}
                  placeholder="Mô tả ngắn gọn về bài viết để hiển thị trên công cụ tìm kiếm..."
                  maxLength={600}
                />
                <div className="flex items-center justify-between">
                  <p className={`text-xs ${
                    form.seoDescription.length === 0 ? "text-muted-foreground" :
                    form.seoDescription.length < 120 ? "text-yellow-500" :
                    form.seoDescription.length <= 160 ? "text-green-500" :
                    "text-red-500"
                  }`}>
                    {form.seoDescription.length === 0 ? "💡 Nên có 120–160 ký tự để tối ưu" :
                     form.seoDescription.length < 120 ? `⚠️ Quá ngắn — cần thêm ${120 - form.seoDescription.length} ký tự nữa` :
                     form.seoDescription.length <= 160 ? "✅ Độ dài tối ưu!" :
                     `❌ Quá dài ${form.seoDescription.length - 160} ký tự — Google sẽ cắt bớt`}
                  </p>
                  <span className={`text-xs font-mono ${
                    form.seoDescription.length === 0 ? "text-muted-foreground" :
                    form.seoDescription.length >= 120 && form.seoDescription.length <= 160 ? "text-green-500" :
                    form.seoDescription.length > 160 ? "text-red-500" : "text-yellow-500"
                  }`}>{form.seoDescription.length}/160</span>
                </div>
              </div>

              {/* SEO Keywords */}
              <div className="space-y-1.5">
                <Label className="font-mono text-xs">Từ khóa SEO (Keywords)</Label>
                <Input
                  value={form.seoKeywords}
                  onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })}
                  placeholder="c, c++, vi điều khiển, stm32..."
                  maxLength={300}
                />
                <div className="flex items-center justify-between">
                  <p className={`text-xs ${
                    form.seoKeywords.length === 0 ? "text-muted-foreground" :
                    form.seoKeywords.length < 10 ? "text-yellow-500" :
                    form.seoKeywords.length <= 300 ? "text-green-500" :
                    "text-red-500"
                  }`}>
                    {form.seoKeywords.length === 0 ? "💡 Nhập từ khóa cách nhau bằng dấu phẩy" :
                     form.seoKeywords.length < 10 ? "⚠️ Nên thêm nhiều từ khóa hơn" :
                     `✅ ${form.seoKeywords.split(",").filter(k => k.trim()).length} từ khóa`}
                  </p>
                  <span className="text-xs font-mono text-muted-foreground">{form.seoKeywords.length}/300</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label className="text-sm">Đăng ngay</Label>
                <p className="text-xs text-muted-foreground">
                  Bật để hiển thị bài viết công khai. Tắt để giữ làm bản nháp.
                </p>
              </div>
              <Switch
                checked={form.published}
                onCheckedChange={(v) => setForm({ ...form, published: v })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                Hủy
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                {editing ? "Lưu thay đổi" : "Tạo bài viết"}
              </Button>
            </DialogFooter>
          </form>
          </div>
        </DialogContent>
      </Dialog>

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
