"use client";

import { Switch } from "@/components/ui/switch";
import type { SitePost } from "@/lib/cv/site-data-server";
import { ArrowLeft,Check,Eye,FileText,Globe,Loader2,Settings,Sparkles } from "lucide-react";
import dynamic from "next/dynamic";
import * as React from "react";
import { CATEGORIES,POST_LAYOUTS,type PostForm } from "./post-types";
import { RichTextEditor } from "./rich-text-editor";
const PostPreview = dynamic(() => import("./post-preview").then((module) => module.PostPreview));

interface PostEditorProps {
  form: PostForm;
  setForm: React.Dispatch<React.SetStateAction<PostForm>>;
  editing: SitePost | null;
  submitting: boolean;
  onSubmit: (e: React.FormEvent, overridePublished?: boolean) => Promise<void>;
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
  const wordCount = React.useMemo(() => {
    const text = form.content.replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim();
    return text ? text.split(" ").length : 0;
  }, [form.content]);
  const saveStatus = submitting ? "Đang lưu…" : "Lưu thủ công";
  const [previewOpen, setPreviewOpen] = React.useState(false);

  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="admin-post-editor fixed inset-0 z-[100] bg-gray-100 dark:bg-[#111418] text-gray-900 dark:text-[#edeff1] overflow-hidden font-sans flex flex-col">

      {/* TOP BAR */}
      <header className="shrink-0 z-[1000] w-full h-[64px] flex items-center justify-between px-6 bg-white/90 dark:bg-[#181c20]/90 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="h-9 px-3.5 inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-[#a5abb2] hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>

          <div className="h-4 w-[1px] bg-gray-200 dark:bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 grid place-items-center rounded-lg bg-[#8eafc3]/15 text-[#8eafc3] font-black text-sm">
              R
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {editing ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-[#a5abb2] mt-0.5">
                {form.title ? form.title.slice(0, 35) + (form.title.length > 35 ? "..." : "") : "Chưa có tiêu đề"}
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] text-gray-500 dark:text-[#a5abb2] ml-4 bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-full border border-gray-200 dark:border-white/5">
            {saveStatus}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            aria-label="Xem trước bài viết"
            className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-[#a5abb2] hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all text-xs font-semibold"
          >
            <Eye className="w-3.5 h-3.5 text-[#8eafc3]" />
            <span className="hidden sm:inline">Xem trước</span>
          </button>

          <button
            type="button"
            onClick={(e) => onSubmit(e as any)}
            disabled={submitting}
            className="h-9 px-4 inline-flex items-center gap-2 rounded-xl bg-[#8eafc3] text-gray-950 hover:bg-[#a9c4d4] font-bold transition-all text-xs shadow-md shadow-[#8eafc3]/10 disabled:opacity-50"
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
          <section className="shrink-0 p-6 border border-gray-200 dark:border-white/10 rounded-2xl bg-white dark:bg-[#181c20] shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="inline-flex items-center gap-2 text-[#8eafc3] text-[11px] font-bold tracking-wider uppercase">
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
                  <label htmlFor="post-title" className="block mb-2 text-xs font-semibold text-gray-700 dark:text-[#a5abb2]">
                    Tiêu đề bài viết <span className="text-red-500">*</span>
                  </label>
                  <input id="post-title"
                    className="w-full h-11 px-3.5 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-[#20252a] text-gray-900 dark:text-white outline-none transition-all focus:border-[#8eafc3] focus:ring-2 focus:ring-[#8eafc3]/20 font-semibold text-sm placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    placeholder="Nhập tiêu đề hấp dẫn cho bài viết..."
                    value={form.title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    required
                  />
                </div>

                <div className="flex-1">
                  <label htmlFor="post-slug" className="block mb-2 text-xs font-semibold text-gray-700 dark:text-[#a5abb2]">
                    Đường dẫn (Slug)
                  </label>
                  <input id="post-slug"
                    className="w-full h-11 px-3.5 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-[#20252a] text-gray-800 dark:text-[#edeff1] outline-none transition-all focus:border-[#8eafc3] focus:ring-2 focus:ring-[#8eafc3]/20 text-sm font-mono"
                    placeholder="tự-động-tạo-từ-tiêu-đề"
                    value={form.slug}
                    onChange={(e) => onSlugChange(e.target.value)}
                  />
                  <div className="mt-1.5 text-[11px] text-gray-500 dark:text-[#a5abb2] flex items-center gap-1.5">
                    URL xem bài: <span className="text-[#8eafc3] font-mono bg-[#8eafc3]/10 px-2 py-0.5 rounded text-[10px] truncate max-w-[240px]">/posts/{slugify(form.slug || form.title)}</span>
                  </div>
                </div>
              </div>

              {/* Category & Publication Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="post-category" className="block mb-2 text-xs font-semibold text-gray-700 dark:text-[#a5abb2]">
                    Chủ đề (Category)
                  </label>
                  <select id="post-category"
                    className="w-full h-11 px-3.5 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-[#20252a] text-gray-900 dark:text-white outline-none transition-all focus:border-[#8eafc3] focus:ring-2 focus:ring-[#8eafc3]/20 text-sm font-medium"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-white dark:bg-[#181c20] text-gray-900 dark:text-white">{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="post-createdAt" className="block mb-2 text-xs font-semibold text-gray-700 dark:text-[#a5abb2]">
                    Ngày đăng bài (Publication Date)
                  </label>
                  <input
                    id="post-createdAt" type="datetime-local"
                    className="w-full h-11 px-3.5 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-[#20252a] text-gray-900 dark:text-white outline-none transition-all focus:border-[#8eafc3] focus:ring-2 focus:ring-[#8eafc3]/20 text-sm font-medium"
                    value={(() => {
                      if (!form.createdAt) return "";
                      try {
                        const d = new Date(form.createdAt);
                        if (isNaN(d.getTime())) return "";
                        const pad = (n: number) => n.toString().padStart(2, "0");
                        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                      } catch {
                        return "";
                      }
                    })()}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) {
                        setForm({ ...form, createdAt: new Date().toISOString() });
                      } else {
                        try {
                          const d = new Date(val);
                          setForm({ ...form, createdAt: d.toISOString() });
                        } catch {
                          setForm({ ...form, createdAt: new Date().toISOString() });
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label htmlFor="post-excerpt" className="block mb-2 text-xs font-semibold text-gray-700 dark:text-[#a5abb2]">
                  Tóm tắt ngắn (Excerpt)
                </label>
                <textarea id="post-excerpt"
                  className="w-full min-h-[76px] p-3.5 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-[#20252a] text-gray-900 dark:text-white outline-none transition-all focus:border-[#8eafc3] focus:ring-2 focus:ring-[#8eafc3]/20 text-sm leading-relaxed resize-y placeholder:text-gray-400 dark:placeholder:text-gray-600"
                  placeholder="Viết một vài câu mô tả ngắn gọn về nội dung bài viết..."
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* RICH TEXT EDITOR CARD */}
          <section className="shrink-0 rounded-2xl bg-white dark:bg-[#181c20] border border-gray-200 dark:border-white/10 shadow-sm">
            <div className="p-4 bg-gray-50/70 dark:bg-[#181c20] border-b border-gray-200 dark:border-white/10 flex items-center justify-between rounded-t-2xl">
              <span className="text-xs font-bold text-gray-800 dark:text-[#edeff1] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#8eafc3]" />
                Nội dung bài viết
              </span>
              <span className="text-[11px] text-gray-500 dark:text-[#a5abb2]">
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

          {/* LAYOUT SELECTOR CARD */}
          <div className="p-5 border border-gray-200 dark:border-white/10 rounded-2xl bg-white dark:bg-[#181c20] shadow-sm">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#8eafc3]" />
              Kiểu bài viết
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {POST_LAYOUTS.map((layout) => {
                const isActive = form.layout === layout.id;
                return (
                  <button
                    key={layout.id}
                    type="button"
                    onClick={() => setForm({ ...form, layout: layout.id })}
                    className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 text-center cursor-pointer ${
                      isActive
                        ? "border-[#8eafc3] bg-[#8eafc3]/5 dark:bg-[#8eafc3]/10 shadow-sm shadow-[#8eafc3]/10"
                        : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#20252a] hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-100 dark:hover:bg-white/5"
                    }`}
                  >
                    <span className="text-xl leading-none">{layout.icon}</span>
                    <span className={`text-[11px] font-bold ${
                      isActive ? "text-[#8eafc3]" : "text-gray-700 dark:text-[#edeff1]"
                    }`}>
                      {layout.label}
                    </span>
                    <span className="text-[9px] leading-tight text-gray-500 dark:text-[#a5abb2]">
                      {layout.description}
                    </span>
                    {isActive && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#8eafc3] grid place-items-center">
                        <Check className="w-2.5 h-2.5 text-gray-950 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* PUBLISH CARD */}
          <div className="p-5 border border-gray-200 dark:border-white/10 rounded-2xl bg-white dark:bg-[#181c20] shadow-sm">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#8eafc3]" />
              Trạng thái xuất bản
            </h3>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-[#20252a] border border-gray-200 dark:border-white/5">
              <div>
                <strong className="block text-xs font-bold text-gray-900 dark:text-white mb-0.5">
                  Đăng ngay
                </strong>
                <span className="text-[10px] text-gray-500 dark:text-[#a5abb2]">
                  {form.published ? "Bài viết hiển thị công khai" : "Lưu dạng bản nháp ẩn"}
                </span>
              </div>
              <Switch
                aria-label="Xuất bản bài viết"
                checked={form.published}
                onCheckedChange={(v) => setForm({ ...form, published: v })}
                className="data-[state=checked]:bg-[#8eafc3]"
              />
            </div>
          </div>

          {/* SEO PREVIEW CARD */}
          <div className="p-5 border border-gray-200 dark:border-white/10 rounded-2xl bg-white dark:bg-[#181c20] shadow-sm">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1 flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#8eafc3]" />
              Cấu hình SEO
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-[#a5abb2] leading-relaxed mb-4">
              Xem trước hiển thị kết quả tìm kiếm trên Google.
            </p>

            {/* Google Search Result Box */}
            <div className="border border-gray-200 dark:border-white/10 rounded-xl p-3.5 bg-gray-50 dark:bg-[#181c20]">
              <div className="text-[10px] font-semibold text-gray-400 dark:text-[#a5abb2] mb-2 flex items-center gap-1">
                <span>🔍 Xem trước trên Google</span>
              </div>
              <div className="text-blue-600 dark:text-[#8eafc3] text-sm font-bold leading-snug line-clamp-2 hover:underline cursor-pointer">
                {form.seoTitle || form.title || "Tiêu đề SEO chưa thiết lập"}
              </div>
              <div className="text-emerald-700 dark:text-[#a9c4d4] text-[11px] my-1 truncate font-mono">
                phanhuynh.id.vn/posts/{slugify(form.slug || form.title)}
              </div>
              <div className="text-gray-600 dark:text-[#a5abb2] text-xs leading-relaxed line-clamp-3">
                {form.seoDescription || form.excerpt || "Nội dung mô tả ngắn sẽ xuất hiện tại đây khi bài viết hiển thị trên Google..."}
              </div>
            </div>
          </div>

          {/* SEO INPUT FIELDS */}
          <div className="p-5 border border-gray-200 dark:border-white/10 rounded-2xl bg-white dark:bg-[#181c20] shadow-sm space-y-4">
            <div>
              <label htmlFor="post-seoTitle" className="block text-xs font-semibold text-gray-700 dark:text-[#a5abb2] mb-2">
                SEO Title
              </label>
              <input id="post-seoTitle"
                className="w-full h-10 px-3 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-[#20252a] text-gray-900 dark:text-white outline-none transition-all focus:border-[#8eafc3] focus:ring-2 focus:ring-[#8eafc3]/20 text-xs font-medium"
                placeholder="Tiêu đề hiển thị trên Google..."
                value={form.seoTitle}
                onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
              />
              <div className="flex justify-between items-center mt-1.5 text-[10px] text-gray-500 dark:text-[#a5abb2]">
                <span>Khuyên dùng: 50–60 ký tự</span>
                <span className={form.seoTitle.length > 60 ? "text-amber-500 font-bold" : "text-[#8eafc3] font-bold"}>
                  {form.seoTitle.length}/60
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="post-seoDescription" className="block text-xs font-semibold text-gray-700 dark:text-[#a5abb2] mb-2">
                Meta Description
              </label>
              <textarea id="post-seoDescription"
                className="w-full min-h-[85px] p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-[#20252a] text-gray-900 dark:text-white outline-none transition-all focus:border-[#8eafc3] focus:ring-2 focus:ring-[#8eafc3]/20 text-xs leading-relaxed resize-y"
                placeholder="Mô tả tóm tắt nội dung cho công cụ tìm kiếm..."
                value={form.seoDescription}
                onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
              />
              <div className="flex justify-between items-center mt-1.5 text-[10px] text-gray-500 dark:text-[#a5abb2]">
                <span>Khuyên dùng: 140–160 ký tự</span>
                <span className={form.seoDescription.length > 160 ? "text-amber-500 font-bold" : "text-[#8eafc3] font-bold"}>
                  {form.seoDescription.length}/160
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="post-seoKeywords" className="block text-xs font-semibold text-gray-700 dark:text-[#a5abb2] mb-2">
                Từ khóa (Keywords)
              </label>
              <textarea id="post-seoKeywords"
                className="w-full min-h-[65px] p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-[#20252a] text-gray-900 dark:text-white outline-none transition-all focus:border-[#8eafc3] focus:ring-2 focus:ring-[#8eafc3]/20 text-xs leading-relaxed resize-y"
                placeholder="từ khóa 1, từ khóa 2, AI, Edge Computing..."
                value={form.seoKeywords}
                onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })}
              />
            </div>
          </div>

        </aside>
      </main>

      {/* BOTTOM FOOTER BAR */}
      <footer className="shrink-0 z-[500] w-full h-[60px] flex items-center justify-between px-6 bg-white/90 dark:bg-[#181c20]/90 backdrop-blur-xl border-t border-gray-200 dark:border-white/10">
        <div className="flex items-center gap-3 text-gray-500 dark:text-[#a5abb2] text-xs">
          <span className="font-semibold text-gray-700 dark:text-[#edeff1]">
            {wordCount.toLocaleString("vi-VN")} từ
          </span>
          <span>·</span>
          <span>~{readingTime} phút đọc</span>
          <span>·</span>
          <span className="text-[#8eafc3]">{saveStatus}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-[#a5abb2] border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 transition-all text-xs font-semibold"
          >
            Hủy
          </button>

          <button
            type="button"
            onClick={(e) => { setForm({ ...form, published: false }); onSubmit(e as any, false); }}
            disabled={submitting}
            className="h-9 px-4 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-[#a5abb2] border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 transition-all text-xs font-semibold"
          >
            Lưu nháp
          </button>

          <button
            type="button"
            onClick={(e) => onSubmit(e as any)}
            disabled={submitting}
            className="h-9 px-5 inline-flex items-center gap-2 rounded-xl bg-[#8eafc3] text-gray-950 font-bold hover:bg-[#a9c4d4] transition-all text-xs shadow-md shadow-[#8eafc3]/15 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 stroke-[2.5]" />}
            <span>Lưu thay đổi</span>
          </button>
        </div>
      </footer>
      {previewOpen && <PostPreview form={form} onClose={() => setPreviewOpen(false)} />}
    </div>
  );
}
