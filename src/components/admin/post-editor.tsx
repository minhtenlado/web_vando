"use client";

import * as React from "react";
import { ArrowLeft, Save, Plus, FileText, Check, Clock, Loader2 } from "lucide-react";
import { RichTextEditor } from "./rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { SitePost } from "@/lib/cv/site-data-server";
import { CATEGORIES, type PostForm } from "./post-types";

interface PostEditorProps {
  form: PostForm;
  setForm: React.Dispatch<React.SetStateAction<PostForm>>;
  editing: SitePost | null;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
  onTitleChange: (v: string) => void;
  onSlugChange: (v: string) => void;
  slugify: (s: string) => string;
}

export function PostEditor({
  form,
  setForm,
  editing,
  submitting,
  onSubmit,
  onClose,
  onTitleChange,
  onSlugChange,
  slugify,
}: PostEditorProps) {
  const [wordCount, setWordCount] = React.useState(0);
  const [saveStatus, setSaveStatus] = React.useState("Đã lưu tự động");

  React.useEffect(() => {
    const text = form.content.replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim();
    setWordCount(text ? text.split(" ").length : 0);
    setSaveStatus("Đang sửa...");
    const timer = setTimeout(() => setSaveStatus("Đã lưu tự động"), 1500);
    return () => clearTimeout(timer);
  }, [form.content]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#050807] text-[#f3f7f5] overflow-hidden font-sans flex flex-col
      bg-[radial-gradient(circle_at_50%_-10%,rgba(54,226,160,0.08),transparent_28%)]">
      
      {/* TOP BAR */}
      <header className="shrink-0 z-[1000] w-full h-[68px] flex items-center justify-between px-6 bg-[#050807]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 mr-3">
            <div className="w-9 h-9 grid place-items-center rounded-[11px] bg-gradient-to-br from-[#42f0b0] to-[#087d5c] text-[#03110b] font-black shadow-[0_0_28px_rgba(54,226,160,0.2)]">
              R
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-[13px] font-extrabold">Research Admin</span>
              <span className="text-[10px] text-[#84918b] mt-1">Article Studio</span>
            </div>
          </div>
          
          <button onClick={onClose} className="h-[38px] px-3 inline-flex items-center justify-center gap-2 border border-white/5 rounded-xl bg-white/5 text-[#aab5b0] hover:-translate-y-[1px] hover:border-[#36e2a0]/30 hover:text-white hover:bg-[#36e2a0]/10 transition-all text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Quay lại</span>
          </button>

          <div className="hidden md:flex items-center gap-2 text-[#84918b] text-xs ml-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#36e2a0] shadow-[0_0_12px_rgba(54,226,160,0.7)]" />
            {saveStatus}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => window.open(`/posts/${slugify(form.slug || form.title)}`, "_blank")} className="h-[38px] px-3 inline-flex items-center justify-center gap-2 border border-white/5 rounded-xl bg-white/5 text-[#aab5b0] hover:-translate-y-[1px] hover:border-[#36e2a0]/30 hover:text-white hover:bg-[#36e2a0]/10 transition-all text-sm font-medium">
            ◉ Xem trước
          </button>
          <button onClick={(e) => onSubmit(e as any)} disabled={submitting} className="h-[38px] px-3 inline-flex items-center justify-center gap-2 border border-[#36e2a0]/20 rounded-xl bg-[#36e2a0]/10 text-[#36e2a0] hover:-translate-y-[1px] hover:bg-[#36e2a0]/20 transition-all text-sm font-medium">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Lưu
          </button>
        </div>
      </header>

      {/* WORKSPACE */}
      <main className="w-full max-w-[1700px] flex flex-col lg:flex-row gap-5 p-5 mx-auto flex-1 min-h-0 overflow-y-auto lg:overflow-hidden">
        
        {/* MAIN COLUMN */}
        <div className="flex-1 min-w-0 flex flex-col gap-4 min-h-0 lg:overflow-hidden">
          
          {/* META CARD */}
          <section className="shrink-0 p-6 border border-[#4BFFBE]/10 rounded-[18px] bg-gradient-to-b from-[#0d1713]/90 to-[#080e0b]/90 shadow-[0_12px_45px_rgba(0,0,0,0.18)]">
            <div className="inline-flex items-center gap-2 mb-4 text-[#76f7c5] text-[11px] font-extrabold tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#36e2a0] shadow-[0_0_10px_rgba(54,226,160,0.75)]" />
              Thông tin bài viết
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col md:flex-row gap-5">
                <div className="flex-1">
                  <label className="block mb-2 text-[#84918b] text-[11px] font-semibold">Tiêu đề *</label>
                  <input
                    className="w-full min-h-[44px] px-3 border border-white/5 rounded-xl bg-white/5 text-white outline-none transition-all focus:border-[#36e2a0]/40 focus:bg-[#36e2a0]/5 focus:ring-2 focus:ring-[#36e2a0]/10 font-medium"
                    placeholder="Nhập tiêu đề bài viết..."
                    value={form.title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-2 text-[#84918b] text-[11px] font-semibold">Slug (tự động nếu để trống)</label>
                  <input
                    className="w-full min-h-[44px] px-3 border border-white/5 rounded-xl bg-white/5 text-[#aab5b0] outline-none transition-all focus:border-[#36e2a0]/40 focus:bg-[#36e2a0]/5 focus:ring-2 focus:ring-[#36e2a0]/10"
                    value={form.slug}
                    onChange={(e) => onSlugChange(e.target.value)}
                  />
                  <div className="mt-1.5 text-[10px] text-[#84918b] flex items-center gap-1.5">
                    Sẽ lưu: <span className="text-[#36e2a0] bg-[#36e2a0]/10 px-1.5 py-0.5 rounded text-[9px] truncate max-w-[200px]">/{slugify(form.slug || form.title)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-5">
                <div className="flex-1">
                  <label className="block mb-2 text-[#84918b] text-[11px] font-semibold">Chủ đề (Category)</label>
                  <select
                    className="w-full min-h-[44px] px-3 border border-white/5 rounded-xl bg-white/5 text-white outline-none transition-all focus:border-[#36e2a0]/40 focus:bg-[#36e2a0]/5 focus:ring-2 focus:ring-[#36e2a0]/10 appearance-none"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-[#050807]">{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block mb-2 text-[#84918b] text-[11px] font-semibold">Ảnh bìa (Cover Image URL)</label>
                  <input
                    className="w-full min-h-[44px] px-3 border border-white/5 rounded-xl bg-white/5 text-white outline-none transition-all focus:border-[#36e2a0]/40 focus:bg-[#36e2a0]/5 focus:ring-2 focus:ring-[#36e2a0]/10"
                    placeholder="https://..."
                    value={form.coverImage}
                    onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-[#84918b] text-[11px] font-semibold">Tóm tắt</label>
                <textarea
                  className="w-full min-h-[80px] p-3 border border-white/5 rounded-xl bg-white/5 text-white outline-none transition-all focus:border-[#36e2a0]/40 focus:bg-[#36e2a0]/5 focus:ring-2 focus:ring-[#36e2a0]/10 leading-relaxed resize-y"
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* EDITOR CARD */}
          <section className="flex-1 min-h-[400px] border border-[#4BFFBE]/10 rounded-[18px] bg-[#08100d] shadow-[0_30px_90px_rgba(0,0,0,0.45)] overflow-hidden flex flex-col relative">
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0a1210] to-[#08100d] pointer-events-none" />
            <div className="relative z-10 flex-1 p-0 flex flex-col min-h-0">
              <RichTextEditor
                value={form.content}
                onChange={(v) => setForm({ ...form, content: v })}
                className="flex-1 flex flex-col min-h-0 [&_.ql-toolbar]:bg-[#0e1814]/90 [&_.ql-toolbar]:backdrop-blur-md [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-white/5 [&_.ql-toolbar]:shrink-0 [&_.ql-container]:border-none [&_.ql-container]:flex-1 [&_.ql-container]:overflow-y-auto [&_.ql-editor]:text-[#d9e0dc] [&_.ql-editor]:text-[17px] [&_.ql-editor]:leading-[1.8] [&_.ql-editor]:p-8 md:[&_.ql-editor]:p-12 lg:[&_.ql-editor]:p-16"
              />
            </div>
          </section>

        </div>

        {/* SIDE COLUMN */}
        <aside className="w-full lg:w-[300px] shrink-0 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
          
          {/* SEO Preview */}
          <div className="p-4 border border-[#4BFFBE]/10 rounded-2xl bg-[#0a1410]/80 shadow-[0_12px_30px_rgba(0,0,0,0.15)] shrink-0">
            <h3 className="text-[#e7eee9] text-xs font-extrabold tracking-wider mb-3">Cấu hình SEO</h3>
            <p className="text-[#84918b] text-[10px] leading-relaxed mb-4">Tối ưu title, description và keywords trước khi xuất bản.</p>
            
            <div className="border border-white/5 rounded-xl p-3 bg-[#07100d]">
              <div className="text-[#76857e] text-[9px] mb-2">🔎 Google Preview</div>
              <div className="text-[#7cf5c2] text-[13px] font-bold leading-snug line-clamp-2">
                {form.seoTitle || form.title || "Tiêu đề SEO"}
              </div>
              <div className="text-[#45c392] text-[10px] my-1.5 truncate">
                phanhuynh.dev/posts/{slugify(form.slug || form.title)}
              </div>
              <div className="text-[#a0aaa5] text-[10px] leading-relaxed line-clamp-3">
                {form.seoDescription || form.excerpt || "Mô tả SEO cho bài viết này..."}
              </div>
            </div>
          </div>

          {/* SEO Fields */}
          <div className="p-4 border border-[#4BFFBE]/10 rounded-2xl bg-[#0a1410]/80 shadow-[0_12px_30px_rgba(0,0,0,0.15)] space-y-4 shrink-0">
            <div>
              <h3 className="text-[#e7eee9] text-xs font-extrabold tracking-wider mb-3">SEO Title</h3>
              <input
                className="w-full min-h-[40px] px-3 border border-white/5 rounded-xl bg-white/5 text-white outline-none transition-all focus:border-[#36e2a0]/40 focus:bg-[#36e2a0]/5 focus:ring-2 focus:ring-[#36e2a0]/10"
                value={form.seoTitle}
                onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
              />
              <div className="flex justify-between items-center mt-1.5 text-[10px] text-[#84918b]">
                <span>Khuyến nghị: 50–60 ký tự</span>
                <span className={form.seoTitle.length > 60 ? "text-[#ffc857]" : "text-[#36e2a0] font-bold"}>
                  {form.seoTitle.length}/60
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-[#e7eee9] text-xs font-extrabold tracking-wider mb-3">Meta Description</h3>
              <textarea
                className="w-full min-h-[90px] p-3 border border-white/5 rounded-xl bg-white/5 text-white outline-none transition-all focus:border-[#36e2a0]/40 focus:bg-[#36e2a0]/5 focus:ring-2 focus:ring-[#36e2a0]/10 resize-y"
                value={form.seoDescription}
                onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
              />
              <div className="flex justify-between items-center mt-1.5 text-[10px] text-[#84918b]">
                <span>Khuyến nghị: 140–160</span>
                <span className={form.seoDescription.length > 160 ? "text-[#ffc857]" : "text-[#36e2a0] font-bold"}>
                  {form.seoDescription.length}/160
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-[#e7eee9] text-xs font-extrabold tracking-wider mb-3">Keywords</h3>
              <textarea
                className="w-full min-h-[70px] p-3 border border-white/5 rounded-xl bg-white/5 text-white outline-none transition-all focus:border-[#36e2a0]/40 focus:bg-[#36e2a0]/5 focus:ring-2 focus:ring-[#36e2a0]/10 resize-y"
                value={form.seoKeywords}
                onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })}
              />
            </div>
          </div>

          {/* Publish */}
          <div className="p-4 border border-[#4BFFBE]/10 rounded-2xl bg-[#0a1410]/80 shadow-[0_12px_30px_rgba(0,0,0,0.15)] shrink-0">
            <h3 className="text-[#e7eee9] text-xs font-extrabold tracking-wider mb-3">Xuất bản</h3>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div>
                <strong className="block text-xs text-white mb-1">Đăng ngay</strong>
                <span className="text-[9px] text-[#84918b]">Hiển thị công khai sau khi lưu.</span>
              </div>
              <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} className="data-[state=checked]:bg-[#36e2a0]" />
            </div>
          </div>

        </aside>
      </main>

      {/* BOTTOM BAR */}
      <footer className="shrink-0 z-[500] w-full h-[64px] flex items-center justify-between px-6 bg-[#060a08]/90 backdrop-blur-xl border-t border-white/5">
        <div className="flex items-center gap-3 text-[#84918b] text-[11px]">
          <span>{wordCount.toLocaleString("vi-VN")} từ</span>
          <span>·</span>
          <span>{saveStatus}</span>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onClose} className="min-h-[40px] px-4 inline-flex items-center justify-center rounded-xl bg-white/5 text-[#aeb8b3] border border-white/5 hover:-translate-y-[1px] transition-all text-sm font-medium">
            Hủy
          </button>
          <button onClick={() => { setForm({ ...form, published: false }); onSubmit(new Event('submit') as any); }} disabled={submitting} className="min-h-[40px] px-4 inline-flex items-center justify-center rounded-xl bg-white/5 text-[#aeb8b3] border border-white/5 hover:-translate-y-[1px] transition-all text-sm font-medium">
            Lưu nháp
          </button>
          <button onClick={(e) => onSubmit(e as any)} disabled={submitting} className="min-h-[40px] px-4 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#55efb6] to-[#18be86] text-[#03110b] font-extrabold shadow-[0_10px_30px_rgba(24,190,134,0.2)] hover:-translate-y-[1px] transition-all text-sm">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Lưu thay đổi
          </button>
        </div>
      </footer>
    </div>
  );
}
