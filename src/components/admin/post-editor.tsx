"use client";

import * as React from "react";
import { ArrowLeft, Check, Loader2, Sparkles, Globe, FileText, Settings, Eye } from "lucide-react";
import { RichTextEditor } from "./rich-text-editor";
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
    const timer = setTimeout(() => setSaveStatus("Đã lưu tự động"), 1200);
    return () => clearTimeout(timer);
  }, [form.content, form.title, form.excerpt]);

  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="fixed inset-0 z-[100] bg-gray-100 dark:bg-[#040806] text-gray-900 dark:text-[#e4ebe7] overflow-hidden font-sans flex flex-col">
      
      {/* TOP BAR */}
      <header className="shrink-0 z-[1000] w-full h-[64px] flex items-center justify-between px-6 bg-white/90 dark:bg-[#070e0b]/90 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 shadow-xs">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose} 
            className="h-9 px-3.5 inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-[#a0afaa] hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>

          <div className="h-4 w-[1px] bg-gray-200 dark:bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 grid place-items-center rounded-lg bg-[#36e2a0]/15 text-[#36e2a0] font-black text-sm">
              R
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {editing ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-[#7d8c86] mt-0.5">
                {form.title ? form.title.slice(0, 35) + (form.title.length > 35 ? "..." : "") : "Chưa có tiêu đề"}
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] text-gray-500 dark:text-[#84938d] ml-4 bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-full border border-gray-200 dark:border-white/5">
            <span className="w-2 h-2 rounded-full bg-[#36e2a0] animate-pulse" />
            {saveStatus}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            type="button"
            onClick={() => window.open(`/posts/${slugify(form.slug || form.title)}`, "_blank")} 
            className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-[#a0afaa] hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all text-xs font-semibold"
          >
            <Eye className="w-3.5 h-3.5 text-[#36e2a0]" />
            <span className="hidden sm:inline">Xem trước</span>
          </button>
          
          <button 
            type="button"
            onClick={(e) => onSubmit(e as any)} 
            disabled={submitting} 
            className="h-9 px-4 inline-flex items-center gap-2 rounded-xl bg-[#36e2a0] text-gray-950 hover:bg-[#2fcb8f] font-bold transition-all text-xs shadow-md shadow-[#36e2a0]/10 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 stroke-[2.5]" />}
            <span>Lưu</span>
          </button>
        </div>
      </header>

      {/* WORKSPACE CONTENT */}
      <main className="w-full max-w-[1700px] flex flex-col lg:flex-row gap-6 p-6 mx-auto flex-1 min-h-0 overflow-hidden">
        
        {/* MAIN COLUMN (META + EDITOR) */}
        <div className="flex-1 min-w-0 flex flex-col gap-6 min-h-0 overflow-y-auto custom-scrollbar pr-1">
          
          {/* ARTICLE METADATA CARD */}
          <section className="shrink-0 p-6 border border-gray-200 dark:border-white/10 rounded-2xl bg-white dark:bg-[#0a120e] shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="inline-flex items-center gap-2 text-[#36e2a0] text-[11px] font-bold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                Thông tin bài viết
              </div>
              {form.published && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  ● Đã xuất bản
                </span>
              )}
            </div>

            <div className="flex flex-col gap-5">
              {/* Title & Slug */}
              <div className="flex flex-col md:flex-row gap-5">
                <div className="flex-1">
                  <label className="block mb-2 text-xs font-semibold text-gray-700 dark:text-[#a0afaa]">
                    Tiêu đề bài viết <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full h-11 px-3.5 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-[#101c16] text-gray-900 dark:text-white outline-none transition-all focus:border-[#36e2a0] focus:ring-2 focus:ring-[#36e2a0]/20 font-semibold text-sm placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    placeholder="Nhập tiêu đề hấp dẫn cho bài viết..."
                    value={form.title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    required
                  />
                </div>

                <div className="flex-1">
                  <label className="block mb-2 text-xs font-semibold text-gray-700 dark:text-[#a0afaa]">
                    Đường dẫn (Slug)
                  </label>
                  <input
                    className="w-full h-11 px-3.5 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-[#101c16] text-gray-800 dark:text-[#c4d1cb] outline-none transition-all focus:border-[#36e2a0] focus:ring-2 focus:ring-[#36e2a0]/20 text-sm font-mono"
                    placeholder="tự-động-tạo-từ-tiêu-đề"
                    value={form.slug}
                    onChange={(e) => onSlugChange(e.target.value)}
                  />
                  <div className="mt-1.5 text-[11px] text-gray-500 dark:text-[#7d8c86] flex items-center gap-1.5">
                    URL xem bài: <span className="text-[#36e2a0] font-mono bg-[#36e2a0]/10 px-2 py-0.5 rounded text-[10px] truncate max-w-[240px]">/posts/{slugify(form.slug || form.title)}</span>
                  </div>
                </div>
              </div>

              {/* Category & Cover Image */}
              <div className="flex flex-col md:flex-row gap-5">
                <div className="flex-1">
                  <label className="block mb-2 text-xs font-semibold text-gray-700 dark:text-[#a0afaa]">
                    Chủ đề (Category)
                  </label>
                  <select
                    className="w-full h-11 px-3.5 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-[#101c16] text-gray-900 dark:text-white outline-none transition-all focus:border-[#36e2a0] focus:ring-2 focus:ring-[#36e2a0]/20 text-sm font-medium"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-white dark:bg-[#0c1511] text-gray-900 dark:text-white">{c}</option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block mb-2 text-xs font-semibold text-gray-700 dark:text-[#a0afaa]">
                    Ảnh bìa (Cover Image URL)
                  </label>
                  <input
                    className="w-full h-11 px-3.5 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-[#101c16] text-gray-900 dark:text-white outline-none transition-all focus:border-[#36e2a0] focus:ring-2 focus:ring-[#36e2a0]/20 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-600 font-mono text-xs"
                    placeholder="https://images.unsplash.com/..."
                    value={form.coverImage}
                    onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block mb-2 text-xs font-semibold text-gray-700 dark:text-[#a0afaa]">
                  Tóm tắt ngắn (Excerpt)
                </label>
                <textarea
                  className="w-full min-h-[76px] p-3.5 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-[#101c16] text-gray-900 dark:text-white outline-none transition-all focus:border-[#36e2a0] focus:ring-2 focus:ring-[#36e2a0]/20 text-sm leading-relaxed resize-y placeholder:text-gray-400 dark:placeholder:text-gray-600"
                  placeholder="Viết một vài câu mô tả ngắn gọn về nội dung bài viết..."
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* RICH TEXT EDITOR CARD */}
          <section className="shrink-0 rounded-2xl bg-white dark:bg-[#0a120e] border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50/70 dark:bg-[#0c1511] border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800 dark:text-[#d1dcd7] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#36e2a0]" />
                Nội dung bài viết
              </span>
              <span className="text-[11px] text-gray-500 dark:text-[#7d8c86]">
                Hỗ trợ định dạng văn bản, Chèn Bảng, Code block, Hình ảnh
              </span>
            </div>
            
            <RichTextEditor
              value={form.content}
              onChange={(v) => setForm({ ...form, content: v })}
              placeholder="Bắt đầu viết nội dung bài viết của bạn tại đây..."
            />
          </section>

        </div>

        {/* RIGHT SIDEBAR (SEO & PUBLISH) */}
        <aside className="w-full lg:w-[320px] shrink-0 flex flex-col gap-5 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
          
          {/* PUBLISH CARD */}
          <div className="p-5 border border-gray-200 dark:border-white/10 rounded-2xl bg-white dark:bg-[#0a120e] shadow-sm">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#36e2a0]" />
              Trạng thái xuất bản
            </h3>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-[#101c16] border border-gray-200 dark:border-white/5">
              <div>
                <strong className="block text-xs font-bold text-gray-900 dark:text-white mb-0.5">
                  Đăng ngay
                </strong>
                <span className="text-[10px] text-gray-500 dark:text-[#7d8c86]">
                  {form.published ? "Bài viết hiển thị công khai" : "Lưu dạng bản nháp ẩn"}
                </span>
              </div>
              <Switch 
                checked={form.published} 
                onCheckedChange={(v) => setForm({ ...form, published: v })} 
                className="data-[state=checked]:bg-[#36e2a0]" 
              />
            </div>
          </div>

          {/* SEO PREVIEW CARD */}
          <div className="p-5 border border-gray-200 dark:border-white/10 rounded-2xl bg-white dark:bg-[#0a120e] shadow-sm">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1 flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#36e2a0]" />
              Cấu hình SEO
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-[#7d8c86] leading-relaxed mb-4">
              Xem trước hiển thị kết quả tìm kiếm trên Google.
            </p>
            
            {/* Google Search Result Box */}
            <div className="border border-gray-200 dark:border-white/10 rounded-xl p-3.5 bg-gray-50 dark:bg-[#0c1511]">
              <div className="text-[10px] font-semibold text-gray-400 dark:text-[#5a6963] mb-2 flex items-center gap-1">
                <span>🔍 Xem trước trên Google</span>
              </div>
              <div className="text-blue-600 dark:text-[#4ee6b3] text-sm font-bold leading-snug line-clamp-2 hover:underline cursor-pointer">
                {form.seoTitle || form.title || "Tiêu đề SEO chưa thiết lập"}
              </div>
              <div className="text-emerald-700 dark:text-[#2fcb8f] text-[11px] my-1 truncate font-mono">
                phanhuynh.id.vn/posts/{slugify(form.slug || form.title)}
              </div>
              <div className="text-gray-600 dark:text-[#9eada7] text-xs leading-relaxed line-clamp-3">
                {form.seoDescription || form.excerpt || "Nội dung mô tả ngắn sẽ xuất hiện tại đây khi bài viết hiển thị trên Google..."}
              </div>
            </div>
          </div>

          {/* SEO INPUT FIELDS */}
          <div className="p-5 border border-gray-200 dark:border-white/10 rounded-2xl bg-white dark:bg-[#0a120e] shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-[#a0afaa] mb-2">
                SEO Title
              </label>
              <input
                className="w-full h-10 px-3 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-[#101c16] text-gray-900 dark:text-white outline-none transition-all focus:border-[#36e2a0] focus:ring-2 focus:ring-[#36e2a0]/20 text-xs font-medium"
                placeholder="Tiêu đề hiển thị trên Google..."
                value={form.seoTitle}
                onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
              />
              <div className="flex justify-between items-center mt-1.5 text-[10px] text-gray-500 dark:text-[#7d8c86]">
                <span>Khuyên dùng: 50–60 ký tự</span>
                <span className={form.seoTitle.length > 60 ? "text-amber-500 font-bold" : "text-[#36e2a0] font-bold"}>
                  {form.seoTitle.length}/60
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-[#a0afaa] mb-2">
                Meta Description
              </label>
              <textarea
                className="w-full min-h-[85px] p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-[#101c16] text-gray-900 dark:text-white outline-none transition-all focus:border-[#36e2a0] focus:ring-2 focus:ring-[#36e2a0]/20 text-xs leading-relaxed resize-y"
                placeholder="Mô tả tóm tắt nội dung cho công cụ tìm kiếm..."
                value={form.seoDescription}
                onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
              />
              <div className="flex justify-between items-center mt-1.5 text-[10px] text-gray-500 dark:text-[#7d8c86]">
                <span>Khuyên dùng: 140–160 ký tự</span>
                <span className={form.seoDescription.length > 160 ? "text-amber-500 font-bold" : "text-[#36e2a0] font-bold"}>
                  {form.seoDescription.length}/160
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-[#a0afaa] mb-2">
                Từ khóa (Keywords)
              </label>
              <textarea
                className="w-full min-h-[65px] p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-[#101c16] text-gray-900 dark:text-white outline-none transition-all focus:border-[#36e2a0] focus:ring-2 focus:ring-[#36e2a0]/20 text-xs leading-relaxed resize-y"
                placeholder="từ khóa 1, từ khóa 2, AI, Edge Computing..."
                value={form.seoKeywords}
                onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })}
              />
            </div>
          </div>

        </aside>
      </main>

      {/* BOTTOM FOOTER BAR */}
      <footer className="shrink-0 z-[500] w-full h-[60px] flex items-center justify-between px-6 bg-white/90 dark:bg-[#070e0b]/90 backdrop-blur-xl border-t border-gray-200 dark:border-white/10">
        <div className="flex items-center gap-3 text-gray-500 dark:text-[#7d8c86] text-xs">
          <span className="font-semibold text-gray-700 dark:text-[#c4d1cb]">
            {wordCount.toLocaleString("vi-VN")} từ
          </span>
          <span>·</span>
          <span>~{readingTime} phút đọc</span>
          <span>·</span>
          <span className="text-[#36e2a0]">{saveStatus}</span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={onClose} 
            className="h-9 px-4 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-[#a0afaa] border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 transition-all text-xs font-semibold"
          >
            Hủy
          </button>
          
          <button 
            type="button"
            onClick={() => { setForm({ ...form, published: false }); onSubmit(new Event('submit') as any); }} 
            disabled={submitting} 
            className="h-9 px-4 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-[#a0afaa] border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 transition-all text-xs font-semibold"
          >
            Lưu nháp
          </button>
          
          <button 
            type="button"
            onClick={(e) => onSubmit(e as any)} 
            disabled={submitting} 
            className="h-9 px-5 inline-flex items-center gap-2 rounded-xl bg-[#36e2a0] text-gray-950 font-bold hover:bg-[#2fcb8f] transition-all text-xs shadow-md shadow-[#36e2a0]/15 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 stroke-[2.5]" />}
            <span>Lưu thay đổi</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
