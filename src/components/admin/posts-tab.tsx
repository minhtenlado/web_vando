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
    setSlugTouched(false);
    setDialogOpen(true);
  }

  function openEdit(p: SitePost) {
    setEditing(p);
    setForm(toForm(p));
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
        <DialogContent className="max-w-[95vw] sm:max-w-[95vw] w-full h-[95vh] flex flex-col overflow-hidden p-0 sm:rounded-xl">
          <div className="flex-1 overflow-y-auto p-6 flex flex-col">
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
              <Label className="font-mono text-xs">Tóm tắt (excerpt)</Label>
              <Textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                rows={3}
                placeholder="Mô tả ngắn về bài viết…"
              />
            </div>

            <div className="space-y-1.5 flex-1 flex flex-col min-h-0">
              <Label className="font-mono text-xs flex items-center justify-between">
                <span>Nội dung bài viết *</span>
              </Label>
              <div className="flex-1 min-h-[300px]">
                <RichTextEditor
                  value={form.content}
                  onChange={(val) => setForm({ ...form, content: val })}
                />
              </div>
            </div>

            <div className="space-y-4 border rounded-xl p-4 bg-muted/20 mt-4">
              <h3 className="font-semibold text-sm">Cấu hình SEO</h3>
              <div className="space-y-1.5">
                <Label className="font-mono text-xs">Tiêu đề SEO (tùy chọn)</Label>
                <Input
                  value={form.seoTitle}
                  onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                  placeholder="Tiêu đề hiển thị trên Google..."
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-mono text-xs">Mô tả SEO (Meta Description)</Label>
                <Textarea
                  value={form.seoDescription}
                  onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                  rows={2}
                  placeholder="Mô tả ngắn gọn về bài viết để hiển thị trên công cụ tìm kiếm..."
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-mono text-xs">Từ khóa SEO (Keywords)</Label>
                <Input
                  value={form.seoKeywords}
                  onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })}
                  placeholder="c, c++, vi điều khiển, stm32..."
                />
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
