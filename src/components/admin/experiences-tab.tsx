"use client";

import * as React from "react";
import { sanitizeHtml } from "@/lib/validation";
import { Loader2, Plus, Pencil, Trash2, Briefcase, Building2, ExternalLink, RefreshCw, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "./rich-text-editor";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
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

function extractYear(period: string): string {
  const m = period.match(/\d{4}/);
  return m ? m[0] : "";
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
  const [searchQuery, setSearchQuery] = React.useState("");

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

  // Stats
  const totalCount = items.length;
  const latestYear = items.length > 0 ? Math.max(...items.map(e => parseInt(extractYear(e.period)) || 0)) : 0;
  const totalStacks = new Set(items.flatMap(e => e.stack ?? [])).size;

  // Filtered items
  const filtered = items.filter(e => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.role.toLowerCase().includes(q) ||
      e.company.toLowerCase().includes(q) ||
      (e.stack ?? []).some(s => s.toLowerCase().includes(q)) ||
      (e.period ?? "").toLowerCase().includes(q) ||
      (e.location ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      {/* ========================= PAGE HEADER ========================== */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] text-primary tracking-widest mb-2">
            <span className="h-px w-5 bg-primary" />
            CONTENT / EXPERIENCE
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Kinh nghiệm</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý các cột mốc nghề nghiệp hiển thị trên portfolio.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchItems} disabled={loading} className="gap-1.5 font-mono text-xs">
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
          <Button size="sm" onClick={openCreate} className="gap-1.5 font-mono text-xs bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="size-3.5" />
            Thêm kinh nghiệm
          </Button>
        </div>
      </div>

      {/* ========================= OVERVIEW STATS ========================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "TOTAL", value: String(totalCount).padStart(2, "0"), note: "kinh nghiệm" },
          { label: "PUBLISHED", value: String(totalCount).padStart(2, "0"), note: "đang hiển thị", green: true },
          { label: "LATEST", value: latestYear > 0 ? String(latestYear) : "—", note: "cột mốc mới nhất" },
          { label: "STACKS", value: totalStacks > 0 ? `${totalStacks}+` : "0", note: "technologies" },
        ].map((s) => (
          <div
            key={s.label}
            className="relative p-4 rounded-xl border border-border bg-card/60"
          >
            <span className="block font-mono text-[9px] text-muted-foreground/60 tracking-widest">
              {s.label}
            </span>
            <span className={`block mt-1.5 text-2xl font-bold ${s.green ? "text-primary" : "text-foreground/90"}`}>
              {s.value}
            </span>
            <span className="block mt-0.5 text-[10px] text-muted-foreground/50">
              {s.note}
            </span>
          </div>
        ))}
      </div>

      {/* ========================= TOOLBAR ========================== */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/50" />
          <Input
            placeholder="Tìm theo vị trí, công ty, công nghệ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs bg-card/40 border-border font-mono"
          />
        </div>
      </div>

      {/* ========================= EXPERIENCE LIST ========================== */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center rounded-xl border border-border bg-card/40">
          <Briefcase className="size-10 text-muted-foreground/30" />
          <div>
            <p className="font-medium text-sm">{searchQuery ? "Không tìm thấy" : "Chưa có kinh nghiệm"}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {searchQuery ? "Thử từ khóa khác." : "Thêm vị trí làm việc đầu tiên."}
            </p>
          </div>
          {!searchQuery && (
            <Button size="sm" onClick={openCreate} className="gap-1.5 text-xs">
              <Plus className="size-3.5" /> Thêm kinh nghiệm
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((e, idx) => {
            const isFirst = idx === 0;
            return (
              <article
                key={e.id}
                className="group relative p-4 sm:p-5 rounded-xl border border-primary/[0.08] bg-gradient-to-br from-card/90 to-card/70 hover:border-primary/20 hover:-translate-y-px transition-all duration-200"
              >
                {/* Main row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {/* Title row */}
                    <div className="flex items-center gap-2.5">
                      <span
                        className={
                          "shrink-0 h-2 w-2 rounded-full " +
                          (isFirst
                            ? "bg-primary shadow-[0_0_8px_rgba(0,230,167,0.55)]"
                            : "bg-muted-foreground/30")
                        }
                      />
                      <h3 className="text-sm font-bold text-foreground/90 truncate">
                        {e.role}
                      </h3>
                    </div>

                    {/* Company */}
                    <div className="mt-1 ml-[18px]">
                      {e.companyUrl ? (
                        <a
                          href={e.companyUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-primary text-[11px] font-semibold hover:underline"
                        >
                          {e.company}
                          <ExternalLink className="size-2.5" />
                        </a>
                      ) : (
                        <span className="text-primary/70 text-[11px] font-semibold">
                          {e.company}
                        </span>
                      )}
                    </div>

                    {/* Meta chips */}
                    <div className="mt-2 ml-[18px] flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono border border-primary/10 text-primary/70 bg-primary/[0.03]">
                        PUBLISHED
                      </span>
                      {e.period && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono border border-border bg-background/50 text-muted-foreground/60">
                          {e.period}
                        </span>
                      )}
                      {e.location && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono border border-border bg-background/50 text-muted-foreground/60">
                          {e.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-start gap-1.5 shrink-0">
                    <button
                      onClick={() => openEdit(e)}
                      className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-border bg-background/50 text-muted-foreground text-[10px] hover:text-foreground hover:border-primary/20 transition-colors"
                    >
                      <Pencil className="size-3" /> Sửa
                    </button>
                    <button
                      onClick={() => setDeleteId(e.id)}
                      className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-border bg-background/50 text-muted-foreground text-[10px] hover:text-destructive hover:border-destructive/20 transition-colors"
                    >
                      <Trash2 className="size-3" /> Xóa
                    </button>
                  </div>
                </div>

                {/* Bottom row */}
                <div className="mt-3 pt-3 ml-[18px] border-t border-border/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {/* Summary */}
                  {e.description && (
                    <p
                      className="text-[11px] text-muted-foreground/60 leading-relaxed line-clamp-2 max-w-3xl"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(e.description || "") }}
                    />
                  )}

                  {/* Tags */}
                  {e.stack && e.stack.length > 0 && (
                    <div className="flex flex-wrap justify-end gap-1 shrink-0">
                      {e.stack.map((s, si) => (
                        <span
                          key={si}
                          className="px-2 py-0.5 rounded-full text-[8px] font-mono border border-primary/[0.06] text-muted-foreground/50"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ========================= EDIT/CREATE DIALOG ========================== */}
      <Dialog open={dialogOpen} onOpenChange={(o) => !submitting && setDialogOpen(o)}>
        <DialogContent className="w-full h-full max-w-full lg:max-w-3xl lg:h-auto lg:max-h-[90vh] flex flex-col overflow-hidden p-0 rounded-none lg:rounded-2xl border-primary/10">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card">
            <div>
              <DialogTitle className="text-base font-bold">
                {editing ? "Chỉnh sửa kinh nghiệm" : "Thêm kinh nghiệm"}
              </DialogTitle>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5 font-mono">
                {editing ? `Đang chỉnh sửa: ${editing.role}` : "Cập nhật nội dung hiển thị trên portfolio."}
              </p>
            </div>
          </div>

          {/* Modal Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-5 space-y-4">

              {/* Section 01: Basic Info */}
              <div className="rounded-xl border border-border/50 bg-card/30 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-mono text-[10px] text-primary">01</span>
                  <span className="text-xs font-bold">Thông tin cơ bản</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="font-mono text-[10px] text-muted-foreground">Vị trí *</Label>
                    <Input
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      placeholder="Embedded / AIoT Intern"
                      required
                      className="h-9 text-xs bg-background/80"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-mono text-[10px] text-muted-foreground flex items-center gap-1.5">
                      <Building2 className="size-3" /> Công ty *
                    </Label>
                    <Input
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      placeholder="Công ty TNHH Công nghệ SkyTech"
                      required
                      className="h-9 text-xs bg-background/80"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-mono text-[10px] text-muted-foreground">Thời gian</Label>
                    <Input
                      value={form.period}
                      onChange={(e) => setForm({ ...form, period: e.target.value })}
                      placeholder="04/2026 — 08/2026"
                      className="h-9 text-xs bg-background/80"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-mono text-[10px] text-muted-foreground">Địa điểm</Label>
                    <Input
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="TP. Hồ Chí Minh, Việt Nam"
                      className="h-9 text-xs bg-background/80"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="font-mono text-[10px] text-muted-foreground">Website công ty</Label>
                    <Input
                      value={form.companyUrl}
                      onChange={(e) => setForm({ ...form, companyUrl: e.target.value })}
                      placeholder="https://skytechnology.vn/"
                      className="h-9 text-xs bg-background/80"
                    />
                  </div>
                </div>
              </div>

              {/* Section 02: Description */}
              <div className="rounded-xl border border-border/50 bg-card/30 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-mono text-[10px] text-primary">02</span>
                  <span className="text-xs font-bold">Mô tả tổng quan</span>
                </div>
                <RichTextEditor
                  value={form.description}
                  onChange={(val) => setForm({ ...form, description: val })}
                />
              </div>

              {/* Section 03: Highlights / Contributions */}
              <div className="rounded-xl border border-border/50 bg-card/30 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-primary">03</span>
                    <span className="text-xs font-bold">Thành tích / Công việc</span>
                  </div>
                  <span className="text-[9px] text-muted-foreground/50 font-mono">Mỗi dòng = 1 mục</span>
                </div>
                <Textarea
                  value={form.highlights}
                  onChange={(e) => setForm({ ...form, highlights: e.target.value })}
                  rows={5}
                  placeholder={"Nghiên cứu và triển khai ứng dụng trên nền tảng Embedded Linux / ARM.\nLàm việc với thiết bị MediaTek MT8365 và môi trường Linux Embedded.\nNghiên cứu triển khai mô hình AI trên thiết bị biên."}
                  className="font-mono text-xs bg-background/80 leading-relaxed"
                />
              </div>

              {/* Section 04: Tech Stack */}
              <div className="rounded-xl border border-border/50 bg-card/30 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-mono text-[10px] text-primary">04</span>
                  <span className="text-xs font-bold">Tech Stack</span>
                </div>

                {/* Tag display */}
                {form.stack.trim() && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {splitCommaOrLines(form.stack).map((tag, ti) => (
                      <span
                        key={ti}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono border border-primary/10 text-muted-foreground bg-primary/[0.02]"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => {
                            const tags = splitCommaOrLines(form.stack).filter((_, i) => i !== ti);
                            setForm({ ...form, stack: tags.join("\n") });
                          }}
                          className="text-muted-foreground/40 hover:text-destructive transition-colors"
                        >
                          <X className="size-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <Textarea
                  value={form.stack}
                  onChange={(e) => setForm({ ...form, stack: e.target.value })}
                  rows={3}
                  placeholder={"Embedded Linux, MediaTek MT8365\nARM, C/C++, Python\nTensorFlow Lite, OpenCV, Edge AI"}
                  className="font-mono text-xs bg-background/80"
                />
              </div>

              {/* Section 05: Gallery */}
              <div className="rounded-xl border border-border/50 bg-card/30 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-primary">05</span>
                    <span className="text-xs font-bold">Ảnh (Gallery)</span>
                  </div>
                  <span className="text-[9px] text-muted-foreground/50 font-mono">{form.images.length} ảnh</span>
                </div>

                {form.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                    {form.images.map((img, i) => (
                      <div key={i} className="group relative aspect-video rounded-lg overflow-hidden border border-border bg-muted/30">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
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

                <div>
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
                        toast({ title: "Hoàn tất", description: `Đã tải lên ${newUrls.length} ảnh.` });
                      } else {
                        toast({ title: "Lỗi", description: "Không thể tải lên ảnh nào.", variant: "destructive" });
                      }

                      e.target.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full border-dashed text-xs"
                    onClick={() => document.getElementById("exp-gallery-upload")?.click()}
                  >
                    <Plus className="size-3.5 mr-1" /> Thêm ảnh
                  </Button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 flex items-center justify-between px-5 py-3 border-t border-border bg-card">
              <span className="font-mono text-[9px] text-muted-foreground/40">
                {editing ? `LAST SAVED · ${new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}` : "NEW ENTRY"}
              </span>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(false)} disabled={submitting} className="text-xs">
                  Hủy
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="text-xs bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
                  {submitting ? <Loader2 className="size-3.5 animate-spin" /> : null}
                  {editing ? "Lưu thay đổi" : "Thêm"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================= DELETE CONFIRM ========================== */}
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
