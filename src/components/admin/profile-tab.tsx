"use client";

import * as React from "react";
import { Loader2, Save, Upload, User, Link2, Mail, Phone, MapPin, Globe, Github, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { SiteProfile } from "@/lib/cv/site-data-server";

type ProfileState = {
  name: string;
  role: string;
  tagline: string;
  location: string;
  email: string;
  phone: string;
  website: string;
  github: string;
  linkedin: string;
  summary: string;
};

const EMPTY: ProfileState = {
  name: "",
  role: "",
  tagline: "",
  location: "",
  email: "",
  phone: "",
  website: "",
  github: "",
  linkedin: "",
  summary: "",
};

export function ProfileTab({ initial, locale }: { initial?: SiteProfile | null, locale: string }) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(!initial);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [avatar, setAvatar] = React.useState<string>(initial?.avatar ?? "");
  const [form, setForm] = React.useState<ProfileState>(
    initial
      ? {
          name: initial.name ?? "",
          role: initial.role ?? "",
          tagline: initial.tagline ?? "",
          location: initial.location ?? "",
          email: initial.email ?? "",
          phone: initial.phone ?? "",
          website: initial.website ?? "",
          github: initial.github ?? "",
          linkedin: initial.linkedin ?? "",
          summary: initial.summary ?? "",
        }
      : EMPTY
  );
  const fileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (initial) {
      setLoading(false);
      setAvatar(initial.avatar ?? "");
      setForm({
        name: initial.name ?? "",
        role: initial.role ?? "",
        tagline: initial.tagline ?? "",
        location: initial.location ?? "",
        email: initial.email ?? "",
        phone: initial.phone ?? "",
        website: initial.website ?? "",
        github: initial.github ?? "",
        linkedin: initial.linkedin ?? "",
        summary: initial.summary ?? "",
      });
    }
    // If not first load, or locale changed, re-fetch profile.
    let cancelled = false;
    setLoading(true);
    fetch(`/api/site-data?locale=${locale}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.profile) {
          const p = data.profile;
          setForm({
            name: p.name ?? "",
            role: p.role ?? "",
            tagline: p.tagline ?? "",
            location: p.location ?? "",
            email: p.email ?? "",
            phone: p.phone ?? "",
            website: p.website ?? "",
            github: p.github ?? "",
            linkedin: p.linkedin ?? "",
            summary: p.summary ?? "",
          });
          setAvatar(p.avatar ?? "");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  function update<K extends keyof ProfileState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "File không hợp lệ", description: "Vui lòng chọn file ảnh.", variant: "destructive" });
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast({ title: "File quá lớn", description: "Tối đa 4MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload-avatar", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data?.message || "Tải lên thất bại.");
      }
      setAvatar(data.url);
      toast({ title: "Đã cập nhật avatar", description: "Ảnh đã được lưu và hiển thị trên trang web." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Tải lên thất bại.";
      toast({ title: "Lỗi tải lên", description: msg, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, avatar, locale }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data?.message || "Lưu thất bại.");
      }
      toast({ title: "Đã lưu thay đổi", description: "Hồ sơ đã được cập nhật." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lưu thất bại.";
      toast({ title: "Lỗi", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="grid gap-4 md:grid-cols-[280px_1fr]">
      {/* Avatar card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="size-4 text-primary" /> Ảnh đại diện
          </CardTitle>
          <CardDescription>Ảnh này hiển thị trên Hero trang web.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-xl border bg-muted/30">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <User className="size-12" />
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
                <Loader2 className="size-6 animate-spin text-primary" />
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            {uploading ? "Đang tải lên…" : "Tải ảnh mới lên"}
          </Button>
          <p className="text-xs text-muted-foreground">PNG · JPEG · WebP · GIF — tối đa 4MB.</p>
        </CardContent>
      </Card>

      {/* Profile form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thông tin cá nhân</CardTitle>
          <CardDescription>Cập nhật tên, vai trò và liên hệ.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Họ và tên" icon={<User className="size-3.5" />}>
              <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Nguyễn Văn A" />
            </Field>
            <Field label="Vai trò" icon={<User className="size-3.5" />}>
              <Input value={form.role} onChange={(e) => update("role", e.target.value)} placeholder="Embedded Software Engineer" />
            </Field>
          </div>

          <Field label="Tagline" icon={<span className="font-mono text-primary">#</span>}>
            <Input value={form.tagline} onChange={(e) => update("tagline", e.target.value)} placeholder="Lập trình viên nhúng · RTOS · IoT" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Địa điểm" icon={<MapPin className="size-3.5" />}>
              <Input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="TP. Hồ Chí Minh" />
            </Field>
            <Field label="Điện thoại" icon={<Phone className="size-3.5" />}>
              <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+84 ..." />
            </Field>
          </div>

          <Field label="Email" icon={<Mail className="size-3.5" />}>
            <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Website" icon={<Globe className="size-3.5" />}>
              <Input value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="yourdomain.dev" />
            </Field>
            <Field label="GitHub" icon={<Github className="size-3.5" />}>
              <Input value={form.github} onChange={(e) => update("github", e.target.value)} placeholder="github.com/you" />
            </Field>
          </div>

          <Field label="LinkedIn" icon={<Linkedin className="size-3.5" />}>
            <Input value={form.linkedin} onChange={(e) => update("linkedin", e.target.value)} placeholder="linkedin.com/in/you" />
          </Field>

          <Field label="Giới thiệu (summary)" icon={<Link2 className="size-3.5" />}>
            <Textarea
              value={form.summary}
              onChange={(e) => update("summary", e.target.value)}
              rows={5}
              placeholder="Mô tả ngắn về kinh nghiệm và định hướng…"
            />
          </Field>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {saving ? "Đang lưu…" : "Lưu thay đổi"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </Label>
      {children}
    </div>
  );
}
