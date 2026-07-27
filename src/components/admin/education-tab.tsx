"use client";

import * as React from "react";
import { Loader2, Save, Trash, Plus, GraduationCap, Award, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { SiteProfile } from "@/lib/cv/site-data-server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { educations as staticEducations, certifications as staticCertifications } from "@/lib/cv/data"

type LocaleString = { vi: string; en: string };

type EducationItem = {
  degree: LocaleString;
  school: LocaleString;
  period: string;
  detail: LocaleString;
};

type CertificationItem = {
  name: string;
  issuer: string;
  year: string;
};

type LanguageItem = {
  name: LocaleString;
  level: LocaleString;
};

type ConfigState = {
  educations: EducationItem[];
  certifications: CertificationItem[];
  languages: LanguageItem[];
};

const fallbackLanguages = [
  { name: { vi: "Tiếng Việt", en: "Vietnamese" }, level: { vi: "Bản ngữ", en: "Native" } },
  { name: { vi: "Tiếng Anh", en: "English" }, level: { vi: "IELTS 7.0", en: "IELTS 7.0" } }
]

const EMPTY: ConfigState = {
  educations: [],
  certifications: [],
  languages: [],
};

function normalizeLocaleObj(val: any): LocaleString {
  if (typeof val === "object" && val !== null && !Array.isArray(val)) {
    return {
      vi: typeof val.vi === "string" ? val.vi : (typeof val.en === "string" ? val.en : ""),
      en: typeof val.en === "string" ? val.en : (typeof val.vi === "string" ? val.vi : ""),
    };
  }
  const str = typeof val === "string" ? val : "";
  return { vi: str, en: str };
}

function parseEducations(arr: any[]): EducationItem[] {
  if (!arr || arr.length === 0) return staticEducations as EducationItem[];
  return (arr ?? []).map((item: any) => ({
    degree: normalizeLocaleObj(item?.degree),
    school: normalizeLocaleObj(item?.school),
    period: String(item?.period ?? ""),
    detail: normalizeLocaleObj(item?.detail),
  }));
}

function parseCertifications(arr: any[]): CertificationItem[] {
  if (!arr || arr.length === 0) return staticCertifications as CertificationItem[];
  return (arr ?? []).map((item: any) => ({
    name: String(item?.name ?? ""),
    issuer: String(item?.issuer ?? ""),
    year: String(item?.year ?? ""),
  }));
}

function parseLanguages(arr: any[]): LanguageItem[] {
  if (!arr || arr.length === 0) return fallbackLanguages as LanguageItem[];
  return (arr ?? []).map((item: any) => ({
    name: normalizeLocaleObj(item?.name),
    level: normalizeLocaleObj(item?.level),
  }));
}

export function EducationTab({ initial, locale }: { initial?: SiteProfile | null, locale: string }) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(!initial);
  const [saving, setSaving] = React.useState(false);
  const [activeLang, setActiveLang] = React.useState<"vi" | "en">("vi");
  const [form, setForm] = React.useState<ConfigState>(
    initial
      ? {
          educations: parseEducations(initial.educations),
          certifications: parseCertifications(initial.certifications),
          languages: parseLanguages(initial.languages),
        }
      : EMPTY
  );

  React.useEffect(() => {
    if (initial) {
      setLoading(false);
      setForm({
        educations: parseEducations(initial.educations),
        certifications: parseCertifications(initial.certifications),
        languages: parseLanguages(initial.languages),
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
            educations: parseEducations(p.educations),
            certifications: parseCertifications(p.certifications),
            languages: parseLanguages(p.languages),
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
      toast({ title: "Đã lưu thay đổi", description: "Học vấn & Chứng chỉ đã được cập nhật." });
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
      <div className="flex justify-end items-center mb-2 gap-4">
        <Tabs value={activeLang} onValueChange={(v) => setActiveLang(v as "vi" | "en")} className="w-[200px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="vi">Tiếng Việt</TabsTrigger>
            <TabsTrigger value="en">Tiếng Anh</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
          Lưu toàn bộ
        </Button>
      </div>

      {/* Học vấn */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><GraduationCap className="size-4 text-primary" /> Học vấn (Education)</CardTitle>
          <CardDescription>Quản lý các thông tin về trường học, bằng cấp.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {form.educations.map((edu, idx) => (
            <div key={idx} className="p-4 border rounded-lg relative space-y-4 bg-muted/20">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 size-8"
                onClick={() => {
                  const arr = [...form.educations];
                  arr.splice(idx, 1);
                  update("educations", arr);
                }}
              >
                <Trash className="size-4" />
              </Button>
              <div className="grid sm:grid-cols-2 gap-4 mr-10">
                <div className="space-y-1">
                  <Label>Tên bằng cấp / Chuyên ngành</Label>
                  <Input
                    value={edu.degree[activeLang]}
                    onChange={(e) => {
                      const arr = [...form.educations];
                      arr[idx].degree[activeLang] = e.target.value;
                      update("educations", arr);
                    }}
                    placeholder="VD: Kỹ sư IoT..."
                  />
                </div>
                <div className="space-y-1">
                  <Label>Trường</Label>
                  <Input
                    value={edu.school[activeLang]}
                    onChange={(e) => {
                      const arr = [...form.educations];
                      arr[idx].school[activeLang] = e.target.value;
                      update("educations", arr);
                    }}
                    placeholder="VD: Đại học Công nghiệp TP.HCM"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Thời gian</Label>
                <Input
                  value={edu.period}
                  onChange={(e) => {
                    const arr = [...form.educations];
                    arr[idx].period = e.target.value;
                    update("educations", arr);
                  }}
                  placeholder="VD: 2022 - 2027 (hiển thị chung cho 2 ngôn ngữ)"
                />
              </div>
              <div className="space-y-1">
                <Label>Mô tả chi tiết</Label>
                <Textarea
                  value={edu.detail[activeLang]}
                  onChange={(e) => {
                    const arr = [...form.educations];
                    arr[idx].detail[activeLang] = e.target.value;
                    update("educations", arr);
                  }}
                  placeholder="Mô tả về ngành học, đồ án..."
                />
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              update("educations", [
                ...form.educations,
                { degree: { vi: "", en: "" }, school: { vi: "", en: "" }, period: "", detail: { vi: "", en: "" } },
              ]);
            }}
          >
            <Plus className="mr-2 size-4" /> Thêm học vấn
          </Button>
        </CardContent>
      </Card>

      {/* Chứng chỉ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Award className="size-4 text-primary" /> Chứng chỉ (Certifications)</CardTitle>
          <CardDescription>Các chứng chỉ chuyên môn đã đạt được (Không chia ngôn ngữ).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {form.certifications.map((cert, idx) => (
            <div key={idx} className="p-4 border rounded-lg relative space-y-4 bg-muted/20">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 size-8"
                onClick={() => {
                  const arr = [...form.certifications];
                  arr.splice(idx, 1);
                  update("certifications", arr);
                }}
              >
                <Trash className="size-4" />
              </Button>
              <div className="grid sm:grid-cols-3 gap-4 mr-10">
                <div className="space-y-1">
                  <Label>Tên chứng chỉ</Label>
                  <Input
                    value={cert.name}
                    onChange={(e) => {
                      const arr = [...form.certifications];
                      arr[idx].name = e.target.value;
                      update("certifications", arr);
                    }}
                    placeholder="VD: FreeRTOS Certified..."
                  />
                </div>
                <div className="space-y-1">
                  <Label>Đơn vị cấp</Label>
                  <Input
                    value={cert.issuer}
                    onChange={(e) => {
                      const arr = [...form.certifications];
                      arr[idx].issuer = e.target.value;
                      update("certifications", arr);
                    }}
                    placeholder="VD: Real Time Engineers Ltd."
                  />
                </div>
                <div className="space-y-1">
                  <Label>Năm</Label>
                  <Input
                    value={cert.year}
                    onChange={(e) => {
                      const arr = [...form.certifications];
                      arr[idx].year = e.target.value;
                      update("certifications", arr);
                    }}
                    placeholder="VD: 2021"
                  />
                </div>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              update("certifications", [
                ...form.certifications,
                { name: "", issuer: "", year: "" },
              ]);
            }}
          >
            <Plus className="mr-2 size-4" /> Thêm chứng chỉ
          </Button>
        </CardContent>
      </Card>

      {/* Ngôn ngữ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><BookOpen className="size-4 text-primary" /> Ngôn ngữ (Languages)</CardTitle>
          <CardDescription>Trình độ ngoại ngữ.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {form.languages.map((lang, idx) => (
            <div key={idx} className="p-4 border rounded-lg relative space-y-4 bg-muted/20">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 size-8"
                onClick={() => {
                  const arr = [...form.languages];
                  arr.splice(idx, 1);
                  update("languages", arr);
                }}
              >
                <Trash className="size-4" />
              </Button>
              <div className="grid sm:grid-cols-2 gap-4 mr-10">
                <div className="space-y-1">
                  <Label>Tên ngôn ngữ</Label>
                  <Input
                    value={lang.name[activeLang]}
                    onChange={(e) => {
                      const arr = [...form.languages];
                      arr[idx].name[activeLang] = e.target.value;
                      update("languages", arr);
                    }}
                    placeholder="VD: Tiếng Việt"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Trình độ / Mức độ</Label>
                  <Input
                    value={lang.level[activeLang]}
                    onChange={(e) => {
                      const arr = [...form.languages];
                      arr[idx].level[activeLang] = e.target.value;
                      update("languages", arr);
                    }}
                    placeholder="VD: Bản ngữ, IELTS 7.0..."
                  />
                </div>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              update("languages", [
                ...form.languages,
                { name: { vi: "", en: "" }, level: { vi: "", en: "" } },
              ]);
            }}
          >
            <Plus className="mr-2 size-4" /> Thêm ngôn ngữ
          </Button>
        </CardContent>
      </Card>
      
      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
          Lưu toàn bộ
        </Button>
      </div>
    </form>
  );
}
