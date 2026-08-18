"use client";

import * as React from "react";
import { sanitizeHtml } from "@/lib/validation";
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
  Calendar,
  User,
  Sparkles,
  Layers,
  Award,
  CheckCircle2,
  Quote,
  Tag,
  FileText,
  TrendingUp,
  Briefcase,
  ListCheck,
  Globe,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "./rich-text-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

export type ProjectResponsibilityItem = {
  title: string;
  subtitle: string;
  icon: string;
};

export type ProjectResultItem = {
  number: string;
  label: string;
};

type ProjectForm = {
  title: string;
  subtitle: string;
  category: string;
  image: string;
  description: string;
  overviewQuote: string;
  year: string;
  role: string;
  highlight: string;
  projectType: string;
  responsibilities: ProjectResponsibilityItem[];
  results: ProjectResultItem[];
  features: string;
  tech: string;
  youtubeUrl: string;
  link: string;
  repo: string;
  images: string[];
  visualsTitle: string;
  videoTitle: string;
  showVideoDemo: boolean;
};

function toForm(p: SiteProject): ProjectForm {
  return {
    title: p.title ?? "",
    subtitle: p.subtitle ?? "",
    category: p.category ?? "",
    image: p.image ?? "",
    description: p.description ?? "",
    overviewQuote: p.overviewQuote ?? "",
    year: p.year ?? "",
    role: p.role ?? "",
    highlight: p.highlight ?? "",
    projectType: p.projectType ?? "",
    responsibilities: Array.isArray(p.responsibilities)
      ? p.responsibilities.map((r) => ({
          title: r?.title ?? "",
          subtitle: r?.subtitle ?? "",
          icon: r?.icon ?? "cpu",
        }))
      : [],
    results: Array.isArray(p.results)
      ? p.results.map((r) => ({
          number: r?.number ?? (r as any)?.value ?? "",
          label: r?.label ?? "",
        }))
      : [],
    features: Array.isArray(p.features) ? p.features.join("\n") : "",
    tech: Array.isArray(p.tech) ? p.tech.join("\n") : "",
    youtubeUrl: p.youtubeUrl ?? "",
    link: p.link ?? "",
    repo: p.repo ?? "",
    images: Array.isArray(p.images) ? p.images : [],
    visualsTitle: p.visualsTitle ?? "",
    videoTitle: p.videoTitle ?? "",
    showVideoDemo: p.showVideoDemo ?? true,
  };
}

const EMPTY: ProjectForm = {
  title: "",
  subtitle: "",
  category: "",
  image: "",
  description: "",
  overviewQuote: "",
  year: "",
  role: "",
  highlight: "",
  projectType: "",
  responsibilities: [],
  results: [],
  features: "",
  tech: "",
  youtubeUrl: "",
  link: "",
  repo: "",
  images: [],
  visualsTitle: "",
  videoTitle: "",
  showVideoDemo: true,
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
  const [activeTab, setActiveTab] = React.useState("basic");
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
    setActiveTab("basic");
    setDialogOpen(true);
  }

  function openEdit(p: SiteProject) {
    setEditing(p);
    setForm(toForm(p));
    setActiveTab("basic");
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
      subtitle: form.subtitle.trim(),
      category: form.category.trim(),
      image: form.image.trim(),
      description: form.description,
      overviewQuote: form.overviewQuote.trim(),
      year: form.year.trim(),
      role: form.role.trim(),
      highlight: form.highlight.trim(),
      projectType: form.projectType.trim(),
      responsibilities: form.responsibilities.filter((r) => r.title.trim() || r.subtitle.trim()),
      results: form.results.filter((r) => r.number.trim() || r.label.trim()),
      features: splitLines(form.features),
      tech: splitCommaOrLines(form.tech),
      youtubeUrl: form.youtubeUrl.trim(),
      link: form.link.trim(),
      repo: form.repo.trim(),
      images: form.images.filter(Boolean),
      visualsTitle: form.visualsTitle.trim(),
      videoTitle: form.videoTitle.trim(),
      showVideoDemo: form.showVideoDemo,
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
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Dự án & Case Studies</h2>
          <p className="text-sm text-muted-foreground">
            Quản lý thông tin chi tiết dự án, case study, hình ảnh, chỉ số đạt được và mã nguồn.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchItems} disabled={loading}>
            <RefreshCw className={`size-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Tải lại
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4 mr-1" />
            Thêm dự án
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <Folder className="size-10 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">Chưa có dự án nào</p>
              <p className="text-sm text-muted-foreground">Bắt đầu bằng cách thêm dự án đầu tiên.</p>
            </div>
            <Button size="sm" onClick={openCreate}>
              <Plus className="size-4 mr-1" /> Thêm dự án
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <Card key={p.id} className="overflow-hidden flex flex-col justify-between border-border hover:border-primary/50 transition-colors">
              <div>
                {/* Image Cover Preview */}
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  {p.image ? (
                    <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <Folder className="size-8" />
                    </div>
                  )}

                  <div className="absolute top-2 left-2 flex flex-wrap gap-1 max-w-[90%]">
                    {p.youtubeUrl && (
                      <Badge className="gap-1 bg-destructive/90 text-white font-medium text-[10px]">
                        <Youtube className="size-3" /> YouTube
                      </Badge>
                    )}
                    {p.projectType && (
                      <Badge variant="secondary" className="font-mono text-[10px] bg-background/80 backdrop-blur">
                        {p.projectType}
                      </Badge>
                    )}
                  </div>

                  {p.year && (
                    <Badge variant="outline" className="absolute bottom-2 right-2 font-mono text-[10px] bg-background/90 backdrop-blur">
                      <Calendar className="size-3 mr-1" /> {p.year}
                    </Badge>
                  )}
                </div>

                <CardHeader className="pb-2 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-bold leading-snug text-foreground">{p.title}</CardTitle>
                  </div>
                  {p.subtitle && (
                    <p className="text-xs text-muted-foreground font-medium line-clamp-1">{p.subtitle}</p>
                  )}

                  <div className="flex flex-wrap gap-1 pt-1">
                    {p.category && <Badge variant="secondary" className="text-[10px]">{p.category}</Badge>}
                    {p.highlight && (
                      <Badge variant="default" className="text-[10px] bg-primary/20 text-primary border-primary/30">
                        <Sparkles className="size-2.5 mr-1" /> {p.highlight}
                      </Badge>
                    )}
                    {p.role && (
                      <Badge variant="outline" className="text-[10px] font-mono">
                        <User className="size-2.5 mr-1" /> {p.role}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-2 text-xs">
                  {p.description && (
                    <div
                      className="line-clamp-2 text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(p.description || "") }}
                    />
                  )}

                  {/* Results preview */}
                  {Array.isArray(p.results) && p.results.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {p.results.slice(0, 3).map((res, rIdx) => (
                        <div key={rIdx} className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground border">
                          <span className="font-mono text-primary font-bold">{res.number}</span>
                          <span className="text-muted-foreground truncate max-w-[100px]">{res.label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tech stack */}
                  {p.tech && p.tech.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {p.tech.slice(0, 4).map((t, i) => (
                        <Badge key={i} variant="outline" className="font-mono text-[10px] py-0">{t}</Badge>
                      ))}
                      {p.tech.length > 4 && (
                        <Badge variant="outline" className="font-mono text-[10px] py-0">+{p.tech.length - 4}</Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </div>

              <div className="p-4 pt-0 border-t mt-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  {p.link && (
                    <Button asChild size="sm" variant="ghost" className="h-8 w-8 p-0" title="Link demo">
                      <a href={p.link} target="_blank" rel="noreferrer">
                        <ExternalLink className="size-3.5" />
                      </a>
                    </Button>
                  )}
                  {p.repo && (
                    <Button asChild size="sm" variant="ghost" className="h-8 w-8 p-0" title="GitHub repo">
                      <a href={p.repo} target="_blank" rel="noreferrer">
                        <Github className="size-3.5" />
                      </a>
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => openEdit(p)}>
                    <Pencil className="size-3.5 mr-1" /> Sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteId(p.id)}
                  >
                    <Trash2 className="size-3.5 mr-1" /> Xóa
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog with Tabs */}
      <Dialog open={dialogOpen} onOpenChange={(o) => !submitting && setDialogOpen(o)}>
        <DialogContent className="w-full h-full max-w-full lg:max-w-4xl lg:h-auto lg:max-h-[92vh] flex flex-col overflow-hidden p-0 rounded-none lg:rounded-xl">
          <DialogHeader className="p-4 md:px-6 md:py-4 border-b shrink-0 bg-muted/30">
            <DialogTitle className="text-lg font-bold text-foreground">
              {editing ? `Sửa dự án: ${editing.title}` : "Thêm dự án / Case Study mới"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Tuỳ chỉnh toàn bộ thông tin dự án, case study, hình ảnh, chỉ số và danh sách công việc.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="px-4 md:px-6 pt-2 pb-0 bg-muted/40 border-b flex flex-wrap gap-1 justify-start rounded-none h-auto w-full shrink-0">
                <TabsTrigger value="basic" className="text-xs py-2">
                  <Globe className="size-3.5 mr-1.5" /> Cơ bản
                </TabsTrigger>
                <TabsTrigger value="casestudy" className="text-xs py-2">
                  <Briefcase className="size-3.5 mr-1.5" /> Meta Case Study
                </TabsTrigger>
                <TabsTrigger value="content" className="text-xs py-2">
                  <FileText className="size-3.5 mr-1.5" /> Mô tả & Quote
                </TabsTrigger>
                <TabsTrigger value="resps" className="text-xs py-2">
                  <ListCheck className="size-3.5 mr-1.5" /> Nhiệm vụ ({form.responsibilities.length})
                </TabsTrigger>
                <TabsTrigger value="results" className="text-xs py-2">
                  <TrendingUp className="size-3.5 mr-1.5" /> Kết quả ({form.results.length})
                </TabsTrigger>
                <TabsTrigger value="gallery" className="text-xs py-2">
                  <ImageIcon className="size-3.5 mr-1.5" /> Ảnh & Tech
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {/* TAB 1: Basic Info */}
                <TabsContent value="basic" className="space-y-4 m-0 outline-none">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="font-semibold text-xs text-foreground">Tiêu đề dự án *</Label>
                      <Input
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="e.g. Smart Parking System with Edge AI"
                        className="font-medium text-foreground bg-background border-input focus:border-primary"
                        required
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="font-semibold text-xs text-foreground">Tiêu đề phụ / Subtitle</Label>
                      <Input
                        value={form.subtitle}
                        onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                        placeholder="e.g. Hệ thống bãi đỗ xe thông minh ứng dụng xử lý ảnh tại biên"
                        className="text-foreground bg-background border-input"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-semibold text-xs text-foreground">Danh mục (Category)</Label>
                      <Input
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        placeholder="e.g. IoT & Embedded Systems"
                        className="text-foreground bg-background border-input"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                        <Youtube className="size-3.5 text-destructive" /> Link YouTube Demo
                      </Label>
                      <Input
                        value={form.youtubeUrl}
                        onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                        placeholder="e.g. https://youtu.be/... hoặc watch?v=..."
                        className="text-foreground bg-background border-input"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                        <ExternalLink className="size-3.5" /> Link Demo / Website
                      </Label>
                      <Input
                        value={form.link}
                        onChange={(e) => setForm({ ...form, link: e.target.value })}
                        placeholder="https://..."
                        className="text-foreground bg-background border-input"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                        <Github className="size-3.5" /> Repository GitHub
                      </Label>
                      <Input
                        value={form.repo}
                        onChange={(e) => setForm({ ...form, repo: e.target.value })}
                        placeholder="https://github.com/..."
                        className="text-foreground bg-background border-input"
                      />
                    </div>
                  </div>

                  {/* Main Cover Image */}
                  <div className="space-y-2 border-t pt-4">
                    <Label className="font-semibold text-xs text-foreground">Ảnh bìa chính (Main Cover)</Label>
                    {form.image && (
                      <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border bg-muted">
                        <img src={form.image} alt="Preview" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="flex gap-2 items-center">
                      <Input
                        value={form.image}
                        onChange={(e) => setForm({ ...form, image: e.target.value })}
                        placeholder="https://... URL ảnh hoặc chọn file bên dưới"
                        className="flex-1 text-xs bg-background"
                      />
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
                            toast({ title: "Đã tải ảnh lên", description: "Ảnh bìa đã lưu thành công." });
                          } catch (err) {
                            toast({ title: "Lỗi tải ảnh", description: err instanceof Error ? err.message : "Upload thất bại.", variant: "destructive" });
                          } finally {
                            setUploadingImage(false);
                            if (imageInputRef.current) imageInputRef.current.value = "";
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={uploadingImage}
                      >
                        {uploadingImage ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4 mr-1" />}
                        {uploadingImage ? "Đang tải…" : "Tải ảnh"}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* TAB 2: Case Study Meta */}
                <TabsContent value="casestudy" className="space-y-4 m-0 outline-none">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-primary" /> Năm thực hiện (Year)
                      </Label>
                      <Input
                        value={form.year}
                        onChange={(e) => setForm({ ...form, year: e.target.value })}
                        placeholder="e.g. 2025 — 2026 hoặc 2025"
                        className="text-foreground bg-background border-input font-mono text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                        <User className="size-3.5 text-primary" /> Vai trò (Role)
                      </Label>
                      <Input
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        placeholder="e.g. Lead AIoT Engineer / Firmware Developer"
                        className="text-foreground bg-background border-input text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                        <Sparkles className="size-3.5 text-primary" /> Điểm nổi bật (Highlight)
                      </Label>
                      <Input
                        value={form.highlight}
                        onChange={(e) => setForm({ ...form, highlight: e.target.value })}
                        placeholder="e.g. Edge AI / Offline-First / Low Latency"
                        className="text-foreground bg-background border-input text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                        <Tag className="size-3.5 text-primary" /> Loại dự án (Project Type)
                      </Label>
                      <Input
                        value={form.projectType}
                        onChange={(e) => setForm({ ...form, projectType: e.target.value })}
                        placeholder="e.g. Research Project / Commercial Product / Open Source"
                        className="text-foreground bg-background border-input text-xs"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label className="font-semibold text-xs text-foreground">Tiêu đề phần Hình ảnh & Sơ đồ</Label>
                      <Input
                        value={form.visualsTitle}
                        onChange={(e) => setForm({ ...form, visualsTitle: e.target.value })}
                        placeholder="e.g. Hình ảnh về cuộc thi (để trống sẽ dùng mặc định)"
                        className="text-foreground bg-background border-input text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-semibold text-xs text-foreground">Tiêu đề phần Video & Demo</Label>
                      <Input
                        value={form.videoTitle}
                        onChange={(e) => setForm({ ...form, videoTitle: e.target.value })}
                        placeholder="e.g. Video chạy thực tế (để trống sẽ dùng mặc định)"
                        className="text-foreground bg-background border-input text-xs"
                      />
                    </div>
                    
                    <div className="space-y-1.5 flex flex-col justify-center">
                      <Label className="font-semibold text-xs text-foreground mb-2">Hiển thị phần Video & Demo</Label>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant={form.showVideoDemo ? "default" : "outline"}
                          size="sm"
                          className="h-8"
                          onClick={() => setForm({ ...form, showVideoDemo: true })}
                        >
                          Bật
                        </Button>
                        <Button
                          type="button"
                          variant={!form.showVideoDemo ? "destructive" : "outline"}
                          size="sm"
                          className="h-8"
                          onClick={() => setForm({ ...form, showVideoDemo: false })}
                        >
                          Tắt
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* TAB 3: Description & Overview Quote */}
                <TabsContent value="content" className="space-y-4 m-0 outline-none">
                  <div className="space-y-1.5">
                    <Label className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                      <Quote className="size-3.5 text-primary" /> Overview Quote (Trích dẫn tổng quan)
                    </Label>
                    <Textarea
                      value={form.overviewQuote}
                      onChange={(e) => setForm({ ...form, overviewQuote: e.target.value })}
                      placeholder="e.g. Giải pháp đỗ xe tự động hoá 100% không phụ thuộc kết nối internet liên tục..."
                      rows={3}
                      className="text-xs bg-background border-input text-foreground font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-semibold text-xs text-foreground">Mô tả chi tiết (Description)</Label>
                    <RichTextEditor
                      value={form.description}
                      onChange={(val) => setForm({ ...form, description: val })}
                      placeholder="Mô tả toàn bộ kiến trúc, bài toán và giải pháp của dự án..."
                    />
                  </div>
                </TabsContent>

                {/* TAB 4: Responsibilities */}
                <TabsContent value="resps" className="space-y-4 m-0 outline-none">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Nhiệm vụ & Trách nhiệm</h4>
                      <p className="text-xs text-muted-foreground">Thêm các công việc, vai trò cụ thể bạn đảm nhận trong dự án.</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          responsibilities: [...f.responsibilities, { title: "", subtitle: "", icon: "cpu" }],
                        }))
                      }
                    >
                      <Plus className="size-4 mr-1" /> Thêm nhiệm vụ
                    </Button>
                  </div>

                  {form.responsibilities.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center text-xs text-muted-foreground">
                      Chưa có nhiệm vụ nào. Nhấn &quot;Thêm nhiệm vụ&quot; để bổ sung.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {form.responsibilities.map((resp, idx) => (
                        <div key={idx} className="grid gap-3 rounded-lg border bg-muted/20 p-3 sm:grid-cols-12 items-center">
                          <div className="sm:col-span-4 space-y-1">
                            <Label className="text-[10px] font-mono text-muted-foreground uppercase">Tiêu đề *</Label>
                            <Input
                              value={resp.title}
                              onChange={(e) => {
                                const val = e.target.value;
                                setForm((f) => {
                                  const copy = [...f.responsibilities];
                                  copy[idx] = { ...copy[idx], title: val };
                                  return { ...f, responsibilities: copy };
                                });
                              }}
                              placeholder="e.g. Thiết kế Firmware & AI"
                              className="text-xs h-8 bg-background text-foreground"
                            />
                          </div>

                          <div className="sm:col-span-5 space-y-1">
                            <Label className="text-[10px] font-mono text-muted-foreground uppercase">Mô tả / Chi tiết</Label>
                            <Input
                              value={resp.subtitle}
                              onChange={(e) => {
                                const val = e.target.value;
                                setForm((f) => {
                                  const copy = [...f.responsibilities];
                                  copy[idx] = { ...copy[idx], subtitle: val };
                                  return { ...f, responsibilities: copy };
                                });
                              }}
                              placeholder="e.g. Viết driver RTOS, tối ưu hóa YOLO nano"
                              className="text-xs h-8 bg-background text-foreground"
                            />
                          </div>

                          <div className="sm:col-span-2 space-y-1">
                            <Label className="text-[10px] font-mono text-muted-foreground uppercase">Icon</Label>
                            <Input
                              value={resp.icon}
                              onChange={(e) => {
                                const val = e.target.value;
                                setForm((f) => {
                                  const copy = [...f.responsibilities];
                                  copy[idx] = { ...copy[idx], icon: val };
                                  return { ...f, responsibilities: copy };
                                });
                              }}
                              placeholder="cpu, code, zap"
                              className="text-xs h-8 font-mono bg-background text-foreground"
                            />
                          </div>

                          <div className="sm:col-span-1 flex justify-end pt-4 sm:pt-0">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={() =>
                                setForm((f) => ({
                                  ...f,
                                  responsibilities: f.responsibilities.filter((_, i) => i !== idx),
                                }))
                              }
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* TAB 5: Results Stat Editor */}
                <TabsContent value="results" className="space-y-4 m-0 outline-none">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Kết quả & Chỉ số đo lường</h4>
                      <p className="text-xs text-muted-foreground">Ví dụ: 93.0% - Độ chính xác; &lt; 10ms - Thời gian xử lý.</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          results: [...f.results, { number: "", label: "" }],
                        }))
                      }
                    >
                      <Plus className="size-4 mr-1" /> Thêm chỉ số
                    </Button>
                  </div>

                  {form.results.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center text-xs text-muted-foreground">
                      Chưa có chỉ số kết quả nào. Nhấn &quot;Thêm chỉ số&quot; để bổ sung.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {form.results.map((res, idx) => (
                        <div key={idx} className="grid gap-3 rounded-lg border bg-muted/20 p-3 sm:grid-cols-12 items-center">
                          <div className="sm:col-span-4 space-y-1">
                            <Label className="text-[10px] font-mono text-muted-foreground uppercase">Con số (Number) *</Label>
                            <Input
                              value={res.number}
                              onChange={(e) => {
                                const val = e.target.value;
                                setForm((f) => {
                                  const copy = [...f.results];
                                  copy[idx] = { ...copy[idx], number: val };
                                  return { ...f, results: copy };
                                });
                              }}
                              placeholder="e.g. 93.0% hoặc < 10ms"
                              className="text-xs h-8 font-semibold font-mono bg-background text-foreground"
                            />
                          </div>

                          <div className="sm:col-span-7 space-y-1">
                            <Label className="text-[10px] font-mono text-muted-foreground uppercase">Nhãn / Đo lường (Label) *</Label>
                            <Input
                              value={res.label}
                              onChange={(e) => {
                                const val = e.target.value;
                                setForm((f) => {
                                  const copy = [...f.results];
                                  copy[idx] = { ...copy[idx], label: val };
                                  return { ...f, results: copy };
                                });
                              }}
                              placeholder="e.g. Độ chính xác nhận diện biển số"
                              className="text-xs h-8 bg-background text-foreground"
                            />
                          </div>

                          <div className="sm:col-span-1 flex justify-end pt-4 sm:pt-0">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={() =>
                                setForm((f) => ({
                                  ...f,
                                  results: f.results.filter((_, i) => i !== idx),
                                }))
                              }
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* TAB 6: Gallery & Features/Tech */}
                <TabsContent value="gallery" className="space-y-4 m-0 outline-none">
                  {/* Gallery */}
                  <div className="space-y-2">
                    <Label className="font-semibold text-xs text-foreground flex items-center justify-between">
                      <span>Bộ sưu tập ảnh (Gallery)</span>
                      <span className="text-[11px] text-muted-foreground font-normal">{form.images.length} ảnh</span>
                    </Label>

                    {form.images.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {form.images.map((img, i) => (
                          <div key={i} className="group relative aspect-video rounded-md overflow-hidden border bg-muted">
                            <img src={img} alt={`Gallery ${i}`} className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))}
                              className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/90 border text-destructive opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center hover:bg-destructive hover:text-white"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-1">
                      <input
                        id="gallery-upload-input"
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
                            toast({ title: "Hoàn tất", description: `Đã tải lên ${newUrls.length} ảnh gallery.` });
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
                        onClick={() => document.getElementById("gallery-upload-input")?.click()}
                      >
                        <Upload className="size-3.5 mr-1.5" /> Thêm nhiều ảnh vào bộ sưu tập
                      </Button>
                    </div>
                  </div>

                  {/* Features & Tech Stack */}
                  <div className="grid gap-4 sm:grid-cols-2 border-t pt-4">
                    <div className="space-y-1.5">
                      <Label className="font-semibold text-xs text-foreground">Tính năng chính (Mỗi dòng 1 mục)</Label>
                      <Textarea
                        value={form.features}
                        onChange={(e) => setForm({ ...form, features: e.target.value })}
                        rows={5}
                        placeholder={"Nhận diện biển số realtime\nTự động mở barie qua ESP32\nĐồng bộ dữ liệu Cloud"}
                        className="font-mono text-xs bg-background text-foreground"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-semibold text-xs text-foreground">Công nghệ sử dụng (Dấu phẩy hoặc dòng mới)</Label>
                      <Textarea
                        value={form.tech}
                        onChange={(e) => setForm({ ...form, tech: e.target.value })}
                        rows={5}
                        placeholder={"STM32, FreeRTOS\nOpenCV, Python, MQTT"}
                        className="font-mono text-xs bg-background text-foreground"
                      />
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>

            <DialogFooter className="p-4 md:px-6 md:py-3 border-t shrink-0 bg-muted/30 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(false)} disabled={submitting}>
                Hủy
              </Button>
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting ? <Loader2 className="size-4 animate-spin mr-1" /> : <Plus className="size-4 mr-1" />}
                {editing ? "Lưu thay đổi" : "Tạo dự án"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !deleting && !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-foreground">Xóa dự án này?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Hành động không thể hoàn tác. Dự án và các tệp đính kèm sẽ bị gỡ khỏi trang web.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className="text-xs">Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90 text-xs"
            >
              {deleting ? <Loader2 className="size-4 animate-spin mr-1" /> : <Trash2 className="size-4 mr-1" />}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
