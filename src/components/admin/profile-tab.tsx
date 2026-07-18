"use client";

import * as React from "react";
import { Loader2, Save, Upload, User, Link2, Mail, Phone, MapPin, Globe, Github, Linkedin, Terminal, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "./rich-text-editor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import type { SiteProfile } from "@/lib/cv/site-data-server";

type StatItem = { value: string; label: { vi: string; en: string } };
type PrincipleItem = { icon: string; title: { vi: string; en: string }; desc: { vi: string; en: string } };
type SkillItem = { name: string; level: number };
type SkillGroupItem = { title: { vi: string; en: string }; icon: string; skills: SkillItem[] };
type SocialItem = { platform: string; url: string; enabled: boolean };

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
  nowText: string;
  principles: PrincipleItem[];
  stats: StatItem[];
  skillGroups: SkillGroupItem[];
  socials: SocialItem[];
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
  nowText: "",
  principles: [],
  stats: [],
  skillGroups: [],
  socials: [
    { platform: "facebook", url: "", enabled: false },
    { platform: "instagram", url: "", enabled: false },
    { platform: "threads", url: "", enabled: false },
    { platform: "zalo", url: "", enabled: false },
    { platform: "linkedin", url: "", enabled: false },
    { platform: "github", url: "", enabled: false },
    { platform: "youtube", url: "", enabled: false }
  ],
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
          nowText: initial.nowText ?? "",
          principles: initial.principles ?? [],
          stats: initial.stats ?? [],
          skillGroups: initial.skillGroups ?? [],
          socials: (initial.socials && initial.socials.length > 0) ? initial.socials : EMPTY.socials,
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
        nowText: initial.nowText ?? "",
        principles: initial.principles ?? [],
        stats: initial.stats ?? [],
        skillGroups: initial.skillGroups ?? [],
        socials: (initial.socials && initial.socials.length > 0) ? initial.socials : EMPTY.socials,
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
            nowText: p.nowText ?? "",
            principles: p.principles ?? [],
            stats: p.stats ?? [],
            skillGroups: p.skillGroups ?? [],
            socials: (p.socials && p.socials.length > 0) ? p.socials : EMPTY.socials,
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

  function update<K extends keyof ProfileState>(key: K, value: ProfileState[K]) {
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

          <div className="space-y-1 mt-4">
            <Label className="text-xs uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-2">
              <Link2 className="w-4 h-4" /> GIỚI THIỆU (SUMMARY)
            </Label>
            <RichTextEditor
              value={form.summary}
              onChange={(val) => update("summary", val)}
              placeholder="Giới thiệu bản thân..."
            />
          </div>

          <div className="space-y-1 mt-4">
            <Label className="text-xs uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4" /> TRẠNG THÁI HIỆN TẠI (›_ NOW)
            </Label>
            <RichTextEditor
              value={form.nowText}
              onChange={(val) => update("nowText", val)}
              placeholder="Bạn đang làm gì hiện tại?"
            />
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-sm">Thống kê (Stats)</h3>
            {form.stats.map((stat, i) => (
              <div key={i} className="flex gap-2 items-start">
                <Input value={stat.value} onChange={(e) => {
                  const newStats = form.stats.map((s, idx) => idx === i ? { ...s, value: e.target.value } : s);
                  update("stats", newStats);
                }} placeholder="6+" className="w-24" />
                <Input value={stat.label.vi} onChange={(e) => {
                  const newStats = form.stats.map((s, idx) => idx === i ? { ...s, label: { ...s.label, vi: e.target.value } } : s);
                  update("stats", newStats);
                }} placeholder="Label (VI)" />
                <Input value={stat.label.en} onChange={(e) => {
                  const newStats = form.stats.map((s, idx) => idx === i ? { ...s, label: { ...s.label, en: e.target.value } } : s);
                  update("stats", newStats);
                }} placeholder="Label (EN)" />
                <Button type="button" variant="outline" size="icon" onClick={() => {
                  const newStats = form.stats.filter((_, idx) => idx !== i);
                  update("stats", newStats);
                }}><Trash className="size-4" /></Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => update("stats", [...form.stats, { value: "", label: { vi: "", en: "" } }])}>+ Thêm</Button>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-sm">Triết lý làm việc (Principles)</h3>
            {form.principles.map((p, i) => (
              <div key={i} className="grid gap-2 p-3 border rounded-md">
                <div className="flex gap-2">
                  <Input value={p.icon} onChange={(e) => {
                    const newP = form.principles.map((pItem, idx) => idx === i ? { ...pItem, icon: e.target.value } : pItem);
                    update("principles", newP);
                  }} placeholder="Icon (Terminal, Zap, ShieldCheck, Layers)" className="w-1/2" />
                  <Button type="button" variant="outline" size="icon" onClick={() => {
                    const newP = [...form.principles];
                    newP.splice(i, 1);
                    update("principles", newP);
                  }}><Trash className="size-4 text-destructive" /></Button>
                </div>
                <Input value={p.title.vi} onChange={(e) => {
                  const newP = form.principles.map((pItem, idx) => idx === i ? { ...pItem, title: { ...pItem.title, vi: e.target.value } } : pItem);
                  update("principles", newP);
                }} placeholder="Tiêu đề (VI)" />
                <Input value={p.title.en} onChange={(e) => {
                  const newP = form.principles.map((pItem, idx) => idx === i ? { ...pItem, title: { ...pItem.title, en: e.target.value } } : pItem);
                  update("principles", newP);
                }} placeholder="Tiêu đề (EN)" />
                <Textarea value={p.desc.vi} onChange={(e) => {
                  const newP = form.principles.map((pItem, idx) => idx === i ? { ...pItem, desc: { ...pItem.desc, vi: e.target.value } } : pItem);
                  update("principles", newP);
                }} placeholder="Mô tả (VI)" rows={2} />
                <Textarea value={p.desc.en} onChange={(e) => {
                  const newP = form.principles.map((pItem, idx) => idx === i ? { ...pItem, desc: { ...pItem.desc, en: e.target.value } } : pItem);
                  update("principles", newP);
                }} placeholder="Mô tả (EN)" rows={2} />
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => update("principles", [...form.principles, { icon: "", title: { vi: "", en: "" }, desc: { vi: "", en: "" } }])}>+ Thêm Triết lý</Button>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-sm">Các nhóm kỹ năng (Skill Groups)</h3>
            {form.skillGroups.map((group, gi) => (
              <div key={gi} className="grid gap-2 p-3 border rounded-md relative bg-muted/20">
                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => {
                  const newG = form.skillGroups.filter((_, idx) => idx !== gi);
                  update("skillGroups", newG);
                }}><Trash className="size-4" /></Button>
                <div className="grid grid-cols-2 gap-2 pr-8">
                  <Input value={group.title.vi} onChange={(e) => {
                    const newG = form.skillGroups.map((g, idx) => idx === gi ? { ...g, title: { ...g.title, vi: e.target.value } } : g);
                    update("skillGroups", newG);
                  }} placeholder="Tên nhóm (VI)" />
                  <Input value={group.title.en} onChange={(e) => {
                    const newG = form.skillGroups.map((g, idx) => idx === gi ? { ...g, title: { ...g.title, en: e.target.value } } : g);
                    update("skillGroups", newG);
                  }} placeholder="Tên nhóm (EN)" />
                  <Input value={group.icon} onChange={(e) => {
                    const newG = form.skillGroups.map((g, idx) => idx === gi ? { ...g, icon: e.target.value } : g);
                    update("skillGroups", newG);
                  }} placeholder="Icon (code, cpu, layers, radio, wrench, circuit-board)" className="col-span-2" />
                </div>
                <div className="pl-4 border-l-2 mt-2 space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground">Kỹ năng con</h4>
                  {group.skills.map((skill, si) => (
                    <div key={si} className="flex gap-2 items-center">
                      <Input value={skill.name} onChange={(e) => {
                        const newG = form.skillGroups.map((g, idx) => idx === gi ? { ...g, skills: g.skills.map((s, sidx) => sidx === si ? { ...s, name: e.target.value } : s) } : g);
                        update("skillGroups", newG);
                      }} placeholder="Tên kỹ năng (VD: C++)" className="flex-1" />
                      <Input type="number" min="0" max="100" value={skill.level} onChange={(e) => {
                        const newG = form.skillGroups.map((g, idx) => idx === gi ? { ...g, skills: g.skills.map((s, sidx) => sidx === si ? { ...s, level: parseInt(e.target.value) || 0 } : s) } : g);
                        update("skillGroups", newG);
                      }} placeholder="%" className="w-20" />
                      <Button type="button" variant="outline" size="icon" onClick={() => {
                        const newG = form.skillGroups.map((g, idx) => idx === gi ? { ...g, skills: g.skills.filter((_, skIdx) => skIdx !== si) } : g);
                        update("skillGroups", newG);
                      }}><Trash className="size-4 text-destructive" /></Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => {
                    const newG = form.skillGroups.map((g, idx) => idx === gi ? { ...g, skills: [...g.skills, { name: "", level: 50 }] } : g);
                    update("skillGroups", newG);
                  }}>+ Thêm kỹ năng con</Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => update("skillGroups", [...form.skillGroups, { title: { vi: "", en: "" }, icon: "", skills: [] }])}>+ Thêm Nhóm Kỹ Năng</Button>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-sm flex items-center gap-2"><Link2 className="size-4"/> Mạng xã hội (Social Links)</h3>
            <p className="text-xs text-muted-foreground">Bật tắt và điền link cho các mạng xã hội bạn muốn hiển thị ở phần Liên hệ.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {form.socials.map((social, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border rounded-md bg-muted/20">
                  <Switch
                    checked={social.enabled}
                    onCheckedChange={(checked) => {
                      const newS = form.socials.map((s, idx) => idx === i ? { ...s, enabled: checked } : s);
                      update("socials", newS);
                    }}
                  />
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-xs font-semibold capitalize">{social.platform}</Label>
                    <Input 
                      value={social.url} 
                      onChange={(e) => {
                        const newS = form.socials.map((s, idx) => idx === i ? { ...s, url: e.target.value } : s);
                        update("socials", newS);
                      }} 
                      placeholder={`Link ${social.platform}...`} 
                      className="h-8 text-xs"
                      disabled={!social.enabled}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
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
