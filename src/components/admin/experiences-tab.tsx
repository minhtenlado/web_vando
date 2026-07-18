"use client";

import * as React from "react";
import { Loader2, Plus, Pencil, Trash2, Briefcase, Building2, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "./rich-text-editor";
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
import type { SiteExperience } from "@/lib/cv/site-data-server";

type ExpForm = {
  role: string;
  company: string;
  companyUrl: string;
  period: string;
  location: string;
  description: string;
  highlights: string;
  stack: string;
  images: string[];
};

const EMPTY: ExpForm = {
  role: "",
  company: "",
  companyUrl: "",
  period: "",
  location: "",
  description: "",
  highlights: "",
  stack: "",
  images: [],
};

function toForm(e: SiteExperience): ExpForm {
  return {
    role: e.role ?? "",
    company: e.company ?? "",
    companyUrl: e.companyUrl ?? "",
    period: e.period ?? "",
    location: e.location ?? "",
    description: e.description ?? "",
    highlights: (e.highlights ?? []).join("\n"),
    stack: (e.stack ?? []).join("\n"),
    images: e.images ?? [],
  };
}

function splitLines(s: string): string[] {
  return s.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}

function splitCommaOrLines(s: string): string[] {
  return s.split(/[\n,]+/).map((l) => l.trim()).filter(Boolean);
}

export function ExperiencesTab({ locale }: { locale: string }) {
  const { toast } = useToast();
  const [items, setItems] = React.useState<SiteExperience[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SiteExperience | null>(null);
  const [form, setForm] = React.useState<ExpForm>(EMPTY);
  const [submitting, setSubmitting] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/experiences?locale=${locale}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data?.message || "Tải thất bại.");
      setItems(data.experiences ?? []);
    } catch (err) {
      toast({
        title: "Lỗi",
        description: err instanceof Error ? err.message : "Không tải được dữ liệu.",
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

  function openEdit(e: SiteExperience) {
    setEditing(e);
    setForm(toForm(e));
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.role.trim() || !form.company.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vị trí và công ty là bắt buộc.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    const payload = {
      role: form.role.trim(),
      company: form.company.trim(),
      companyUrl: form.companyUrl.trim(),
      period: form.period.trim(),
      location: form.location.trim(),
      description: form.description,
      highlights: splitLines(form.highlights),
      stack: splitCommaOrLines(form.stack),
      images: form.images,
      locale,
    };
    try {
      const url = editing ? `/api/admin/experiences/${editing.id}` : "/api/admin/experiences";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data?.message || "Lưu thất bại.");
      toast({
        title: editing ? "Đã cập nhật kinh nghiệm" : "Đã thêm kinh nghiệm",
        description: `${payload.role} @ ${payload.company}`,
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
      const res = await fetch(`/api/admin/experiences/${deleteId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data?.message || "Xóa thất bại.");
      toast({ title: "Đã xóa kinh nghiệm" });
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
          <h2 className="text-lg font-semibold">Kinh nghiệm</h2>
          <p className="text-sm text-muted-foreground">Lịch sử làm việc hiển thị trên portfolio.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchItems} disabled={loading}>
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Tải lại
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4" />
            Thêm kinh nghiệm
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <Briefcase className="size-10 text-muted-foreground" />
            <div>
              <p className="font-medium">Chưa có kinh nghiệm</p>
              <p className="text-sm text-muted-foreground">Thêm vị trí làm việc đầu tiên.</p>
            </div>
            <Button size="sm" onClick={openCreate}>
              <Plus className="size-4" /> Thêm kinh nghiệm
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((e) => (
            <Card key={e.id}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base">
                      <span className="text-primary">{e.role}</span>
                      <span className="text-muted-foreground"> @ </span>
                      {e.companyUrl ? (
                        <a
                          href={e.companyUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 hover:text-primary"
                        >
                          {e.company}
                          <ExternalLink className="size-3" />
                        </a>
                      ) : (
                        e.company
                      )}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground font-mono">
                      {e.period && <span>⏱ {e.period}</span>}
                      {e.location && <span>📍 {e.location}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-8" onClick={() => openEdit(e)}>
                      <Pencil className="size-3.5" /> Sửa
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(e.id)}>
                      <Trash2 className="size-3.5" /> Xóa
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                {e.description && (
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: e.description }} />
                )}
                {e.stack && e.stack.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {e.stack.map((s, i) => (
                      <Badge key={i} variant="outline" className="font-mono text-[10px]">{s}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(o) => !submitting && setDialogOpen(o)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa kinh nghiệm" : "Thêm kinh nghiệm"}</DialogTitle>
            <DialogDescription>
              {editing ? `Đang chỉnh sửa: ${editing.role}` : "Mỗi dòng highlights/stack là một mục riêng."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="font-mono text-xs">Vị trí *</Label>
                <Input
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="Senior Embedded Engineer"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-mono text-xs flex items-center gap-1.5">
                  <Building2 className="size-3.5" /> Công ty *
                </Label>
                <Input
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="ABC Tech JSC"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="font-mono text-xs">Link website công ty</Label>
                <Input
                  value={form.companyUrl}
                  onChange={(e) => setForm({ ...form, companyUrl: e.target.value })}
                  placeholder="https://company.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-mono text-xs">Thời gian</Label>
                <Input
                  value={form.period}
                  onChange={(e) => setForm({ ...form, period: e.target.value })}
                  placeholder="2022 — Nay"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-mono text-xs">Địa điểm</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="TP. Hồ Chí Minh"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-mono text-xs">Mô tả tổng quan</Label>
              <RichTextEditor
                value={form.description}
                onChange={(val) => setForm({ ...form, description: val })}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="font-mono text-xs">Thành tích (mỗi dòng 1 mục)</Label>
                <Textarea
                  value={form.highlights}
                  onChange={(e) => setForm({ ...form, highlights: e.target.value })}
                  rows={5}
                  placeholder={"Thiết kế firmware RTOS\nTối ưu bộ nhớ 30%"}
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-mono text-xs">Tech stack (phẩy hoặc dòng mới)</Label>
                <Textarea
                  value={form.stack}
                  onChange={(e) => setForm({ ...form, stack: e.target.value })}
                  rows={5}
                  placeholder={"STM32, FreeRTOS\nC, CAN, I2C"}
                  className="font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5 border-t pt-4">
              <Label className="font-mono text-xs flex items-center justify-between">
                <span>Ảnh minh chứng (Gallery)</span>
                <span className="text-[10px] text-muted-foreground font-normal">{form.images.length} ảnh</span>
              </Label>
              
              {form.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {form.images.map((img, i) => (
                    <div key={i} className="group relative aspect-video rounded-md overflow-hidden border bg-muted/30">
                      <img src={img} alt={`Gallery ${i}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))}
                        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/80 backdrop-blur border text-destructive opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center hover:bg-destructive hover:text-white"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-2">
                <input
                  id="exp-gallery-upload"
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    if (!files.length) return;
                    
                    toast({ title: "Đang tải lên...", description: `Đang tải lên ${files.length} ảnh.` });
                    const newUrls: string[] = [];
                    
                    for (const file of files) {
                      if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) continue;
                      try {
                        const fd = new FormData();
                        fd.append("file", file);
                        const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
                        const data = await res.json().catch(() => ({}));
                        if (res.ok && data.ok) newUrls.push(data.url);
                      } catch (err) {
                        console.error(err);
                      }
                    }
                    
                    if (newUrls.length > 0) {
                      setForm((f) => ({ ...f, images: [...f.images, ...newUrls] }));
                      toast({ title: "Hoàn tất", description: `Đã tải lên ${newUrls.length} ảnh minh chứng.` });
                    } else {
                      toast({ title: "Lỗi", description: "Không thể tải lên ảnh nào.", variant: "destructive" });
                    }
                    
                    // Reset input
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full border-dashed"
                  onClick={() => document.getElementById("exp-gallery-upload")?.click()}
                >
                  <Plus className="size-4 mr-1" /> Thêm ảnh minh chứng
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                Hủy
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                {editing ? "Lưu thay đổi" : "Thêm"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !deleting && !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa kinh nghiệm này?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động không thể hoàn tác. Mục sẽ bị gỡ khỏi trang web.
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
