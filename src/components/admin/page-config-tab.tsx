"use client";

import * as React from "react";
import { Loader2, Save, Link2, Terminal, Trash, FileText, Code2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "./rich-text-editor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { SiteProfile } from "@/lib/cv/site-data-server";

type StatItem = { value: string; label: { vi: string; en: string } };
type PrincipleItem = { icon: string; title: { vi: string; en: string }; desc: { vi: string; en: string } };
type SkillItem = { name: string; level: number };
type SkillGroupItem = { title: { vi: string; en: string }; icon: string; skills: SkillItem[] };

type ConfigState = {
  summary: string;
  nowText: string;
  principles: PrincipleItem[];
  stats: StatItem[];
  skillGroups: SkillGroupItem[];
  aboutSubtitle: string;
  skillsSubtitle: string;
  experienceSubtitle: string;
};

const EMPTY: ConfigState = {
  summary: "",
  nowText: "",
  principles: [],
  stats: [],
  skillGroups: [],
  aboutSubtitle: "",
  skillsSubtitle: "",
  experienceSubtitle: "",
};

export function PageConfigTab({ initial, locale }: { initial?: SiteProfile | null, locale: string }) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(!initial);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState<ConfigState>(
    initial
      ? {
          summary: initial.summary ?? "",
          nowText: initial.nowText ?? "",
          principles: initial.principles ?? [],
          stats: initial.stats ?? [],
          skillGroups: initial.skillGroups ?? [],
          aboutSubtitle: initial.aboutSubtitle ?? "",
          skillsSubtitle: initial.skillsSubtitle ?? "",
          experienceSubtitle: initial.experienceSubtitle ?? "",
        }
      : EMPTY
  );

  React.useEffect(() => {
    if (initial) {
      setLoading(false);
      setForm({
        summary: initial.summary ?? "",
        nowText: initial.nowText ?? "",
        principles: initial.principles ?? [],
        stats: initial.stats ?? [],
        skillGroups: initial.skillGroups ?? [],
        aboutSubtitle: initial.aboutSubtitle ?? "",
        skillsSubtitle: initial.skillsSubtitle ?? "",
        experienceSubtitle: initial.experienceSubtitle ?? "",
      });
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/site-data?locale=${locale}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.profile) {
          const p = data.profile;
          setForm({
            summary: p.summary ?? "",
            nowText: p.nowText ?? "",
            principles: p.principles ?? [],
            stats: p.stats ?? [],
            skillGroups: p.skillGroups ?? [],
            aboutSubtitle: p.aboutSubtitle ?? "",
            skillsSubtitle: p.skillsSubtitle ?? "",
            experienceSubtitle: p.experienceSubtitle ?? "",
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  function update<K extends keyof ConfigState>(key: K, value: ConfigState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, locale }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data?.message || "Lưu thất bại.");
      }
      toast({ title: "Đã lưu thay đổi", description: "Thành phần trang đã được cập nhật." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lưu thất bại.";
      toast({ title: "Lỗi", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Skeleton className="h-96 w-full rounded-xl" />;
  }

  return (
    <form onSubmit={handleSave} className="grid gap-6">
      
      {/* Giới thiệu */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><FileText className="size-4 text-primary" /> Phần Giới Thiệu (About)</CardTitle>
          <CardDescription>Cấu hình các thành phần trong phần giới thiệu.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Tiêu đề phụ (Subtitle)</Label>
            <Input 
              value={form.aboutSubtitle} 
              onChange={(e) => update("aboutSubtitle", e.target.value)} 
              placeholder="VD: Hành trình của một kỹ sư nhúng..." 
            />
            <p className="text-xs text-muted-foreground">Nếu để trống, hệ thống sẽ hiển thị nội dung mặc định.</p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-2">
              <Link2 className="w-4 h-4" /> GIỚI THIỆU (SUMMARY)
            </Label>
            <RichTextEditor
              value={form.summary}
              onChange={(val) => update("summary", val)}
              placeholder="Sơ lược về tôi..."
            />
          </div>

          <div className="space-y-2 border-t pt-4">
            <Label className="text-xs uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4" /> TRẠNG THÁI HIỆN TẠI (›_ NOW)
            </Label>
            <RichTextEditor
              value={form.nowText}
              onChange={(val) => update("nowText", val)}
              placeholder="Bạn đang làm gì hiện tại?"
            />
          </div>

          <div className="space-y-4 border-t pt-4">
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

          <div className="space-y-4 border-t pt-4">
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
        </CardContent>
      </Card>

      {/* Kỹ Năng */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Code2 className="size-4 text-primary" /> Phần Kỹ Năng (Skills)</CardTitle>
          <CardDescription>Cấu hình các nhóm kỹ năng và tiêu đề phụ.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Tiêu đề phụ (Subtitle)</Label>
            <Input 
              value={form.skillsSubtitle} 
              onChange={(e) => update("skillsSubtitle", e.target.value)} 
              placeholder="VD: Từ lập trình bare-metal đến RTOS..." 
            />
            <p className="text-xs text-muted-foreground">Nếu để trống, hệ thống sẽ hiển thị nội dung mặc định.</p>
          </div>

          <div className="space-y-4 border-t pt-4">
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
        </CardContent>
      </Card>

      {/* Kinh nghiệm */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Briefcase className="size-4 text-primary" /> Phần Kinh Nghiệm (Experience)</CardTitle>
          <CardDescription>Cấu hình tiêu đề phụ cho phần Kinh nghiệm.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Tiêu đề phụ (Subtitle)</Label>
            <Input 
              value={form.experienceSubtitle} 
              onChange={(e) => update("experienceSubtitle", e.target.value)} 
              placeholder="VD: Hơn 6 năm xây dựng sản phẩm nhúng..." 
            />
            <p className="text-xs text-muted-foreground">Nếu để trống, hệ thống sẽ hiển thị nội dung mặc định.</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end mt-4">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {saving ? "Đang lưu…" : "Lưu cấu hình"}
        </Button>
      </div>
    </form>
  );
}
