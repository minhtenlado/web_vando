"use client";

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
import { Button } from "@/components/ui/button";
import { Card,CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { normalizeSearch } from "@/lib/cv/presentation";
import type { SitePost } from "@/lib/cv/site-data-server";
import { FileText,Loader2,Plus,RefreshCw,Search,Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import * as React from "react";
import { CATEGORIES,slugify,supportsTutorialEditor,type PostForm } from "./post-types";
const PostEditor = dynamic(() => import("./post-editor").then((module) => module.PostEditor));
const TutorialEditor = dynamic(() => import("./tutorial-editor").then((module) => module.TutorialEditor));

function getEmptyForm(): PostForm {
  return {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    published: false,
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
  const [fetchError, setFetchError] = React.useState("");
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
    setFetchError("");
    try {
      const res = await fetch(`/api/admin/posts?locale=${locale}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data?.message || "Tải thất bại.");
      setItems(data.posts ?? []);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Không tải được bài viết.");
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
        title: !isPublished ? "Đã lưu bản nháp" : "Đã xuất bản bài viết",
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
      const matchesSearch = normalizeSearch(post.title + " " + post.excerpt).includes(normalizeSearch(searchQuery));
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
              aria-label="Tìm bài viết"
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
      ) : fetchError ? (
        <p role="alert" className="admin-data-notice">{fetchError} Hãy tải lại để thử lại.</p>
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <FileText className="size-10 text-muted-foreground" />
            <div>
              <p className="font-medium">{items.length ? "Không có bài viết khớp bộ lọc" : "Chưa có bài viết"}</p>
              <p className="text-sm text-muted-foreground">{items.length ? "Thử từ khóa hoặc danh mục khác." : "Bắt đầu bằng một bản nháp mới."}</p>
            </div>
            <Button size="sm" onClick={openCreate}>
              <Plus className="size-4" /> Viết bài mới
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="admin-table-scroll" role="region" aria-label="Quản lý bài viết" tabIndex={0}>
          <table className="admin-content-table">
            <thead><tr><th scope="col">Bài viết</th><th scope="col">Danh mục</th><th scope="col">Xuất bản</th><th scope="col">Thao tác</th></tr></thead>
            <tbody>{filteredItems.map((post) => <tr key={post.id}>
              <th scope="row"><span className="admin-table-title">{post.title}</span><span className="admin-table-secondary">{formatDate(post.createdAt)}</span></th>
              <td>{post.category || '—'}<span className="admin-table-secondary">{post.layout === 'tutorial' ? 'Tutorial' : 'Bài viết'}</span></td>
              <td>{post.published ? 'Đã xuất bản' : 'Bản nháp'}</td>
              <td><div className="admin-row-actions">
                <Button asChild size="sm" variant="ghost"><a href={'/admin/posts/' + post.id + '/preview'} target="_blank" rel="noreferrer" aria-label={'Xem trước ' + post.title}>Xem trước</a></Button>
                <Button size="sm" variant="outline" onClick={() => openEdit(post)}>Sửa</Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteId(post.id)} aria-label={'Xóa ' + post.title}>Xóa</Button>
              </div></td>
            </tr>)}</tbody>
          </table>
        </div>
      )}

      {dialogOpen && (
        form.layout === 'tutorial' && supportsTutorialEditor(form.content) ? (
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
