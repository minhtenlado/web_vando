"use client";

import * as React from "react";
import { Loader2, Plus, Pencil, Trash2, FileText, RefreshCw, Eye, EyeOff } from "lucide-react";
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
import type { SitePost } from "@/lib/cv/site-data-server";

type PostForm = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published: boolean;
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
  // Post type state to separate normal posts from PDF uploads
  const [postType, setPostType] = React.useState<"text" | "pdf">("text");

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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Bài viết</h2>
          <p className="text-sm text-muted-foreground">Blog cá nhân, hỗ trợ Markdown.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchItems} disabled={loading}>
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Tải lại
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4" />
            Viết bài mới
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
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
        <div className="space-y-3">
          {items.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                      {p.title}
                      {p.published ? (
                        <Badge className="gap-1 bg-primary/15 text-primary border-primary/30">
                          <Eye className="size-3" /> Đã đăng
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <EyeOff className="size-3" /> Bản nháp
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground font-mono">
                      <span>/{p.slug}</span>
                      {p.createdAt && <span>· {formatDate(p.createdAt)}</span>}
                      {p.updatedAt && p.updatedAt !== p.createdAt && <span>· cập nhật {formatDate(p.updatedAt)}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-8" onClick={() => openEdit(p)}>
                      <Pencil className="size-3.5" /> Sửa
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(p.id)}>
                      <Trash2 className="size-3.5" /> Xóa
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {p.excerpt && (
                <CardContent className="text-sm text-muted-foreground">
                  <p className="line-clamp-2">{p.excerpt}</p>
                </CardContent>
              )}
            </Card>
          ))}
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

            <div className="space-y-1.5">
              <Label className="font-mono text-xs">Ngày đăng bài</Label>
              <Input
                type="date"
                value={form.createdAt}
                onChange={(e) => setForm({ ...form, createdAt: e.target.value })}
                className="w-full sm:w-[200px]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-mono text-xs">Ảnh bìa (Cover Image URL)</Label>
              <Input
                value={form.coverImage}
                onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                placeholder="https://..."
              />
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
