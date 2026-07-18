"use client";

import * as React from "react";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Youtube,
  ExternalLink,
  Github,
  Folder,
  RefreshCw,
  Upload,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import type { SiteProject } from "@/lib/cv/site-data-server";

type ProjectForm = {
  title: string;
  category: string;
  image: string;
  description: string;
  features: string;
  tech: string;
  youtubeUrl: string;
  link: string;
  repo: string;
};

function toForm(p: SiteProject): ProjectForm {
  return {
    title: p.title ?? "",
    category: p.category ?? "",
    image: p.image ?? "",
    description: p.description ?? "",
    features: (p.features ?? []).join("\n"),
    tech: (p.tech ?? []).join("\n"),
    youtubeUrl: p.youtubeUrl ?? "",
    link: p.link ?? "",
    repo: p.repo ?? "",
  };
}

const EMPTY: ProjectForm = {
  title: "",
  category: "",
  image: "",
  description: "",
  features: "",
  tech: "",
  youtubeUrl: "",
  link: "",
  repo: "",
};

function splitLines(s: string): string[] {
  return s
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

function splitCommaOrLines(s: string): string[] {
  return s
    .split(/[\n,]+/)
    .map((l) => l.trim())
    .filter(Boolean);
}

export function ProjectsTab({ locale }: { locale: string }) {
  const { toast } = useToast();
  const [items, setItems] = React.useState<SiteProject[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SiteProject | null>(null);
  const [form, setForm] = React.useState<ProjectForm>(EMPTY);
  const [submitting, setSubmitting] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const imageInputRef = React.useRef<HTMLInputElement>(null);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/projects?locale=${locale}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data?.message || "Tải danh sách thất bại.");
      setItems(data.projects ?? []);
    } catch (err) {
      toast({
        title: "Lỗi",
        description: err instanceof Error ? err.message : "Không tải được dự án.",
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
    setForm(EMPTY);
    setDialogOpen(true);
  }

  function openEdit(p: SiteProject) {
    setEditing(p);
    setForm(toForm(p));
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      toast({ title: "Thiếu tiêu đề", description: "Vui lòng nhập tên dự án.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const payload = {
      title: form.title.trim(),
      category: form.category.trim(),
      image: form.image.trim(),
      description: form.description,
      features: splitLines(form.features),
      tech: splitCommaOrLines(form.tech),
      youtubeUrl: form.youtubeUrl.trim(),
      link: form.link.trim(),
      repo: form.repo.trim(),
      locale,
    };
    try {
      const url = editing ? `/api/admin/projects/${editing.id}` : "/api/admin/projects";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data?.message || "Lưu thất bại.");
      toast({
        title: editing ? "Đã cập nhật dự án" : "Đã tạo dự án",
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
      const res = await fetch(`/api/admin/projects/${deleteId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data?.message || "Xóa thất bại.");
      toast({ title: "Đã xóa dự án" });
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
          <h2 className="text-lg font-semibold">Dự án</h2>
          <p className="text-sm text-muted-foreground">Quản lý danh sách dự án hiển thị trên portfolio.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchItems} disabled={loading}>
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Tải lại
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4" />
            Thêm dự án
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <Folder className="size-10 text-muted-foreground" />
            <div>
              <p className="font-medium">Chưa có dự án nào</p>
              <p className="text-sm text-muted-foreground">Bắt đầu bằng cách thêm dự án đầu tiên.</p>
            </div>
            <Button size="sm" onClick={openCreate}>
              <Plus className="size-4" /> Thêm dự án
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <div className="relative aspect-video w-full overflow-hidden bg-muted/40">
                {p.image ? (
                  <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <Folder className="size-8" />
                  </div>
                )}
                {p.youtubeUrl && (
                  <Badge className="absolute left-2 top-2 gap-1 bg-destructive/90 text-white">
                    <Youtube className="size-3" /> YouTube
                  </Badge>
                )}
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-tight">{p.title}</CardTitle>
                </div>
                {p.category && <Badge variant="secondary" className="w-fit">{p.category}</Badge>}
              </CardHeader>
              <CardContent className="space-y-2">
                {p.description && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                )}
                {p.tech && p.tech.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {p.tech.slice(0, 4).map((t, i) => (
                      <Badge key={i} variant="outline" className="font-mono text-[10px]">{t}</Badge>
                    ))}
                    {p.tech.length > 4 && (
                      <Badge variant="outline" className="font-mono text-[10px]">+{p.tech.length - 4}</Badge>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-1 pt-2">
                  {p.link && (
                    <Button asChild size="sm" variant="ghost" className="h-8">
                      <a href={p.link} target="_blank" rel="noreferrer">
                        <ExternalLink className="size-3.5" />
                      </a>
                    </Button>
                  )}
                  {p.repo && (
                    <Button asChild size="sm" variant="ghost" className="h-8">
                      <a href={p.repo} target="_blank" rel="noreferrer">
                        <Github className="size-3.5" />
                      </a>
                    </Button>
                  )}
                  <div className="ml-auto flex gap-1">
                    <Button size="sm" variant="outline" className="h-8" onClick={() => openEdit(p)}>
                      <Pencil className="size-3.5" /> Sửa
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(p.id)}>
                      <Trash2 className="size-3.5" /> Xóa
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => !submitting && setDialogOpen(o)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa dự án" : "Thêm dự án mới"}</DialogTitle>
            <DialogDescription>
              {editing ? `Đang chỉnh sửa: ${editing.title}` : "Điền thông tin dự án. Các mục features/tech mỗi dòng một mục."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-1">
                <Label className="font-mono text-xs">Tiêu đề *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="STM32 Weather Station"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-mono text-xs">Danh mục</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="IoT / Firmware / Web"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-mono text-xs">Ảnh dự án</Label>
              {form.image && (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted/30">
                  <img src={form.image} alt="Preview" className="h-full w-full object-cover" />
                </div>
              )}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                disabled={uploadingImage}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (!file.type.startsWith("image/")) {
                    toast({ title: "File không hợp lệ", description: "Vui lòng chọn file ảnh.", variant: "destructive" });
                    return;
                  }
                  if (file.size > 5 * 1024 * 1024) {
                    toast({ title: "File quá lớn", description: "Tối đa 5MB.", variant: "destructive" });
                    return;
                  }
                  setUploadingImage(true);
                  try {
                    const fd = new FormData();
                    fd.append("file", file);
                    const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok || !data.ok) throw new Error(data?.message || "Upload thất bại.");
                    setForm((f) => ({ ...f, image: data.url }));
                    toast({ title: "Đã tải ảnh lên", description: "Ảnh đã được lưu thành công." });
                  } catch (err) {
                    toast({ title: "Lỗi tải ảnh", description: err instanceof Error ? err.message : "Upload thất bại.", variant: "destructive" });
                  } finally {
                    setUploadingImage(false);
                    if (imageInputRef.current) imageInputRef.current.value = "";
                  }
                }}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                  {uploadingImage ? "Đang tải…" : "Tải ảnh lên"}
                </Button>
                {form.image && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setForm((f) => ({ ...f, image: "" }))}>
                    Xoá ảnh
                  </Button>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Hoặc dán URL ảnh trực tiếp:</p>
                <Input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://... hoặc /project-1.png"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-mono text-xs">Mô tả</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                placeholder="Mô tả ngắn về dự án…"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="font-mono text-xs">Tính năng (mỗi dòng 1 mục)</Label>
                <Textarea
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                  rows={5}
                  placeholder={"Đo nhiệt độ, độ ẩm\nGửi dữ liệu lên MQTT\nOTA firmware"}
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-mono text-xs">Tech stack (phẩy hoặc dòng mới)</Label>
                <Textarea
                  value={form.tech}
                  onChange={(e) => setForm({ ...form, tech: e.target.value })}
                  rows={5}
                  placeholder={"STM32, FreeRTOS\nMQTT, C"}
                  className="font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-mono text-xs flex items-center gap-1.5">
                <Youtube className="size-3.5 text-destructive" /> Link YouTube
              </Label>
              <Input
                value={form.youtubeUrl}
                onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                placeholder="https://youtu.be/... hoặc https://www.youtube.com/watch?v=..."
              />
              <p className="text-xs text-muted-foreground">
                Dán link YouTube (youtu.be/ID hoặc youtube.com/watch?v=ID) để hiển thị video demo.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="font-mono text-xs flex items-center gap-1.5">
                  <ExternalLink className="size-3.5" /> Link demo
                </Label>
                <Input
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="https://demo.example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-mono text-xs flex items-center gap-1.5">
                  <Github className="size-3.5" /> Repository
                </Label>
                <Input
                  value={form.repo}
                  onChange={(e) => setForm({ ...form, repo: e.target.value })}
                  placeholder="https://github.com/..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                Hủy
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                {editing ? "Lưu thay đổi" : "Tạo dự án"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !deleting && !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa dự án này?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động không thể hoàn tác. Dự án sẽ bị gỡ khỏi trang web ngay lập tức.
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
