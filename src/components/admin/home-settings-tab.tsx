"use client";

import * as React from "react";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const defaults = {
  portfolioName: "Engineering Lab",
  portfolioTagline: "Embedded systems, edge AI, and robotics projects.",
  heroHeadlineVi: "Dự án kỹ thuật. Sản phẩm thực tế.",
  heroHeadlineEn: "Engineering projects. Built systems.",
  heroDescriptionVi: "Khám phá các hệ thống phần cứng, phần mềm, trí tuệ nhân tạo và công nghệ nhúng — từ thiết kế đến thử nghiệm.",
  heroDescriptionEn: "Explore hardware, software, artificial intelligence, and embedded systems through real project work.",
  heroPrimaryLabelVi: "Khám phá dự án",
  heroPrimaryLabelEn: "Explore projects",
  heroPrimaryUrl: "#projects",
  heroSecondaryLabelVi: "Mã nguồn trên GitHub",
  heroSecondaryLabelEn: "GitHub source code",
  heroSecondaryUrl: "",
  sectionFeaturedEnabled: true,
  sectionProjectsEnabled: true,
  sectionMediaEnabled: true,
  sectionNotesEnabled: true,
};

type HomeSettings = typeof defaults;

function parseSettings(value: unknown): Partial<HomeSettings> {
  if (typeof value !== "string") return {};
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const result: Partial<HomeSettings> = {};
    for (const key of Object.keys(defaults) as (keyof HomeSettings)[]) {
      const candidate = (parsed as Record<string, unknown>)[key];
      if (typeof candidate === typeof defaults[key]) {
        Object.assign(result, { [key]: candidate });
      }
    }
    return result;
  } catch {
    return {};
  }
}

export function HomeSettingsTab() {
  const { toast } = useToast();
  const [form, setForm] = React.useState<HomeSettings>(defaults);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/settings", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data?.error || "Không tải được cấu hình trang chủ.");
        if (!cancelled) setForm({ ...defaults, ...parseSettings(data.settings) });
      })
      .catch((error) => {
        if (!cancelled) toast({ title: "Không tải được cấu hình", description: error instanceof Error ? error.message : "Vui lòng thử lại.", variant: "destructive" });
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [toast]);

  function update<K extends keyof HomeSettings>(key: K, value: HomeSettings[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: form }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Không thể lưu cấu hình.");
      toast({ title: "Đã lưu cấu hình trang chủ", description: "Nội dung được đọc trực tiếp từ cấu hình đã lưu." });
    } catch (error) {
      toast({ title: "Lưu thất bại", description: error instanceof Error ? error.message : "Vui lòng thử lại.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="flex min-h-52 items-center justify-center text-muted-foreground"><Loader2 className="mr-2 size-4 animate-spin" />Đang tải cấu hình…</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-lg font-semibold">Trang chủ & nhận diện</h2><p className="text-sm text-muted-foreground">Cập nhật nội dung hero và các khu vực công khai.</p></div>
        <Button onClick={save} disabled={saving} className="min-h-10">{saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}Lưu thay đổi</Button>
      </div>

      <section className="space-y-4 rounded-xl border bg-card p-4 sm:p-5">
        <div><h3 className="font-semibold">Branding</h3><p className="text-xs text-muted-foreground">Tên hiển thị mặc định là Engineering Lab. Domain được cố định theo tên miền hiện tại.</p></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="lab-display-name">Tên website</Label><Input id="lab-display-name" value={form.portfolioName} maxLength={80} onChange={(event) => update("portfolioName", event.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="lab-domain">Domain</Label><Input id="lab-domain" value="phanhuynh.id.vn" readOnly /></div>
          <div className="space-y-2 sm:col-span-2"><Label htmlFor="lab-tagline">Tagline</Label><Input id="lab-tagline" value={form.portfolioTagline} maxLength={180} onChange={(event) => update("portfolioTagline", event.target.value)} /></div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-4 sm:p-5">
        <div><h3 className="font-semibold">Hero — Vietnamese</h3><p className="text-xs text-muted-foreground">Sử dụng nội dung cho ngôn ngữ Tiếng Việt.</p></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2"><Label htmlFor="hero-headline-vi">Headline</Label><Input id="hero-headline-vi" value={form.heroHeadlineVi} maxLength={160} onChange={(event) => update("heroHeadlineVi", event.target.value)} /></div>
          <div className="space-y-2 sm:col-span-2"><Label htmlFor="hero-description-vi">Description</Label><Textarea id="hero-description-vi" value={form.heroDescriptionVi} maxLength={500} rows={3} onChange={(event) => update("heroDescriptionVi", event.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="hero-primary-vi">Primary CTA</Label><Input id="hero-primary-vi" value={form.heroPrimaryLabelVi} maxLength={60} onChange={(event) => update("heroPrimaryLabelVi", event.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="hero-secondary-vi">Secondary CTA</Label><Input id="hero-secondary-vi" value={form.heroSecondaryLabelVi} maxLength={60} onChange={(event) => update("heroSecondaryLabelVi", event.target.value)} /></div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-4 sm:p-5">
        <div><h3 className="font-semibold">Hero — English</h3><p className="text-xs text-muted-foreground">English copy is stored separately.</p></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2"><Label htmlFor="hero-headline-en">Headline</Label><Input id="hero-headline-en" value={form.heroHeadlineEn} maxLength={160} onChange={(event) => update("heroHeadlineEn", event.target.value)} /></div>
          <div className="space-y-2 sm:col-span-2"><Label htmlFor="hero-description-en">Description</Label><Textarea id="hero-description-en" value={form.heroDescriptionEn} maxLength={500} rows={3} onChange={(event) => update("heroDescriptionEn", event.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="hero-primary-en">Primary CTA</Label><Input id="hero-primary-en" value={form.heroPrimaryLabelEn} maxLength={60} onChange={(event) => update("heroPrimaryLabelEn", event.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="hero-secondary-en">Secondary CTA</Label><Input id="hero-secondary-en" value={form.heroSecondaryLabelEn} maxLength={60} onChange={(event) => update("heroSecondaryLabelEn", event.target.value)} /></div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-4 sm:p-5">
        <div><h3 className="font-semibold">Hero actions</h3><p className="text-xs text-muted-foreground">Links accept an internal path or a complete HTTP(S) URL.</p></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="hero-primary-url">Primary CTA URL</Label><Input id="hero-primary-url" value={form.heroPrimaryUrl} maxLength={300} onChange={(event) => update("heroPrimaryUrl", event.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="hero-secondary-url">Secondary CTA URL</Label><Input id="hero-secondary-url" value={form.heroSecondaryUrl} maxLength={300} placeholder="Leave blank to use the GitHub URL" onChange={(event) => update("heroSecondaryUrl", event.target.value)} /></div>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border bg-card p-4 sm:p-5">
        <div><h3 className="font-semibold">Public sections</h3><p className="text-xs text-muted-foreground">Featured projects are selected on each project record.</p></div>
        {([
          ["sectionFeaturedEnabled", "Featured projects"],
          ["sectionProjectsEnabled", "Project explorer"],
          ["sectionMediaEnabled", "Hardware & software showcase"],
          ["sectionNotesEnabled", "Engineering notes"],
        ] as const).map(([key, label]) => (
          <label key={key} className="flex min-h-11 items-center justify-between gap-4 border-t pt-3 text-sm">
            <span>{label}</span><input type="checkbox" checked={form[key]} onChange={(event) => update(key, event.target.checked)} className="size-4 accent-primary" />
          </label>
        ))}
      </section>
    </div>
  );
}
