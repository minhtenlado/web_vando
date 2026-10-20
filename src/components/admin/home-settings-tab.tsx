'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { publicSettingsDefaults as site } from '@/lib/cv/public-settings';
import { Loader2,Save } from 'lucide-react';
import { useCallback,useEffect,useState } from 'react';

const defaults = {
  portfolioName: site.portfolioName, portfolioTagline: site.portfolioTagline,
  heroHeadlineVi: site.heroHeadlineVi, heroHeadlineEn: site.heroHeadlineEn,
  heroDescriptionVi: site.heroDescriptionVi, heroDescriptionEn: site.heroDescriptionEn,
  heroPrimaryLabelVi: site.heroPrimaryLabelVi, heroPrimaryLabelEn: site.heroPrimaryLabelEn,
  heroPrimaryUrl: site.heroPrimaryUrl, sectionFeaturedEnabled: site.sectionFeaturedEnabled,
};
type HomeSettings = typeof defaults;

export function HomeSettingsTab() {
  const { toast } = useToast();
  const [form, setForm] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/admin/settings', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Không tải được cấu hình.');
      const stored: Record<string, unknown> = JSON.parse(data.settings || '{}');
      const next = { ...defaults };
      for (const key of Object.keys(defaults) as (keyof HomeSettings)[]) if (typeof stored[key] === typeof defaults[key]) Object.assign(next, { [key]: stored[key] });
      setForm(next);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không tải được cấu hình.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  function update<K extends keyof HomeSettings>(key: K, value: HomeSettings[K]) { setForm((current) => ({ ...current, [key]: value })); }
  async function save() {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ settings: form }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Không thể lưu cấu hình.');
      toast({ title: 'Đã lưu cấu hình trang chủ' });
    } catch (reason) { toast({ title: 'Lưu thất bại', description: reason instanceof Error ? reason.message : 'Vui lòng thử lại.', variant: 'destructive' }); }
    finally { setSaving(false); }
  }
  if (loading) return <p role="status">Đang tải cấu hình…</p>;
  if (error) return <div className="admin-data-notice" role="alert"><p>{error}</p><Button onClick={() => void load()}>Thử lại</Button></div>;

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Cấu hình trang chủ</h2><p className="text-sm text-muted-foreground">Tên website và phần giới thiệu ngắn. Nội dung dự án, bài viết được quản lý riêng.</p></div><Button onClick={() => void save()} disabled={saving}>{saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}Lưu thay đổi</Button></div>
    <section className="space-y-4 rounded-lg border p-4 sm:p-5"><h3 className="font-semibold">Thông tin website</h3>
      <div className="space-y-2"><Label htmlFor="site-name">Tên hiển thị</Label><Input id="site-name" maxLength={80} value={form.portfolioName} onChange={(e) => update('portfolioName', e.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="site-tagline">Mô tả cuối trang</Label><Input id="site-tagline" maxLength={180} value={form.portfolioTagline} onChange={(e) => update('portfolioTagline', e.target.value)} /></div>
    </section>
    <section className="space-y-4 rounded-lg border p-4 sm:p-5"><h3 className="font-semibold">Giới thiệu — Tiếng Việt</h3>
      <div className="space-y-2"><Label htmlFor="intro-title-vi">Tiêu đề</Label><Input id="intro-title-vi" maxLength={120} value={form.heroHeadlineVi} onChange={(e) => update('heroHeadlineVi', e.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="intro-description-vi">Mô tả</Label><Textarea id="intro-description-vi" rows={3} maxLength={500} value={form.heroDescriptionVi} onChange={(e) => update('heroDescriptionVi', e.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="intro-link-vi">Nhãn liên kết</Label><Input id="intro-link-vi" maxLength={60} value={form.heroPrimaryLabelVi} onChange={(e) => update('heroPrimaryLabelVi', e.target.value)} /></div>
    </section>
    <section className="space-y-4 rounded-lg border p-4 sm:p-5"><h3 className="font-semibold">Introduction — English</h3>
      <div className="space-y-2"><Label htmlFor="intro-title-en">Title</Label><Input id="intro-title-en" maxLength={120} value={form.heroHeadlineEn} onChange={(e) => update('heroHeadlineEn', e.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="intro-description-en">Description</Label><Textarea id="intro-description-en" rows={3} maxLength={500} value={form.heroDescriptionEn} onChange={(e) => update('heroDescriptionEn', e.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="intro-link-en">Link label</Label><Input id="intro-link-en" maxLength={60} value={form.heroPrimaryLabelEn} onChange={(e) => update('heroPrimaryLabelEn', e.target.value)} /></div>
    </section>
    <section className="space-y-4 rounded-lg border p-4 sm:p-5">
      <div className="space-y-2"><Label htmlFor="intro-link-url">Đường dẫn giới thiệu</Label><Input id="intro-link-url" maxLength={300} value={form.heroPrimaryUrl} onChange={(e) => update('heroPrimaryUrl', e.target.value)} /></div>
      <label className="flex min-h-11 items-center justify-between gap-4 text-sm"><span>Hiển thị dự án được đánh dấu Featured</span><input type="checkbox" checked={form.sectionFeaturedEnabled} onChange={(e) => update('sectionFeaturedEnabled', e.target.checked)} /></label>
      <p className="text-xs text-muted-foreground">Mục Featured chỉ xuất hiện khi có dự án được chọn. Dự án và bài viết luôn có trên trang chủ.</p>
    </section>
  </div>;
}
