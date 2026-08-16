"use client";

import * as React from "react";
import "./tutorial-editor.css";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import type { SitePost } from "@/lib/cv/site-data-server";
import { CATEGORIES, POST_LAYOUTS, type PostForm } from "./post-types";
import { slugify } from "./posts-tab";
import { Switch } from "@/components/ui/switch";

export interface TutorialData {
  intro: string;
  objectives: string[];
  blocks: Block[];
}

export type Block =
  | { id: string; type: "paragraph"; content: string }
  | { id: string; type: "heading"; content: string }
  | { id: string; type: "step"; title: string; content: string; code: string; lang: string }
  | { id: string; type: "code"; code: string; lang: string }
  | { id: string; type: "tip"; content: string }
  | { id: string; type: "warning"; content: string }
  | { id: string; type: "result"; content: string }
  | { id: string; type: "image"; url: string };

interface TutorialEditorProps {
  form: PostForm;
  setForm: React.Dispatch<React.SetStateAction<PostForm>>;
  editing: SitePost | null;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
  onTitleChange: (v: string) => void;
  onSlugChange: (v: string) => void;
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function parseData(html: string): TutorialData {
  const match = html.match(/<!--TUTORIAL_DATA:\s*(.*?)\s*-->/);
  if (match) {
    try {
      return JSON.parse(match[1]);
    } catch {
      // ignore
    }
  }
  return {
    intro: "",
    objectives: ["", "", "", ""],
    blocks: [{ id: generateId(), type: "paragraph", content: "" }]
  };
}

function generateHTML(data: TutorialData) {
  let html = `<!--TUTORIAL_DATA: ${JSON.stringify(data)} -->\n`;
  html += `<div class="tutorial-content">\n`;
  
  if (data.intro || data.objectives.some(o => o.trim())) {
    html += `  <div class="tutorial-intro">\n`;
    if (data.intro) html += `    <p>${data.intro}</p>\n`;
    const validObjs = data.objectives.filter(o => o.trim());
    if (validObjs.length > 0) {
      html += `    <ul class="objectives">\n`;
      validObjs.forEach(obj => {
        html += `      <li>${obj}</li>\n`;
      });
      html += `    </ul>\n`;
    }
    html += `  </div>\n`;
  }

  let inSteps = false;

  data.blocks.forEach(block => {
    if (block.type === 'step') {
      if (!inSteps) {
        html += `  <ol class="steps">\n`;
        inSteps = true;
      }
      html += `    <li>\n`;
      html += `      <h3>${block.title || 'Bước'}</h3>\n`;
      html += `      <p>${block.content}</p>\n`;
      if (block.code) {
        html += `      <pre><code class="language-${block.lang.toLowerCase()}">${block.code}</code></pre>\n`;
      }
      html += `    </li>\n`;
    } else {
      if (inSteps) {
        html += `  </ol>\n`;
        inSteps = false;
      }
      
      if (block.type === 'paragraph') {
        html += `  <p>${block.content}</p>\n`;
      } else if (block.type === 'heading') {
        html += `  <h2>${block.content}</h2>\n`;
      } else if (block.type === 'code') {
        html += `  <pre><code class="language-${block.lang.toLowerCase()}">${block.code}</code></pre>\n`;
      } else if (block.type === 'tip') {
        html += `  <blockquote>[!TIP]<br>${block.content}</blockquote>\n`;
      } else if (block.type === 'warning') {
        html += `  <blockquote>[!CAUTION]<br>${block.content}</blockquote>\n`;
      } else if (block.type === 'result') {
        html += `  <blockquote>[!NOTE]<br><strong>KẾT QUẢ:</strong> ${block.content}</blockquote>\n`;
      } else if (block.type === 'image') {
        html += `  <img src="${block.url}" alt="image" />\n`;
      }
    }
  });

  if (inSteps) {
    html += `  </ol>\n`;
  }

  html += `</div>`;
  return html;
}

export function TutorialEditor({
  form,
  setForm,
  editing,
  submitting,
  onSubmit,
  onClose,
  onTitleChange,
  onSlugChange,
}: TutorialEditorProps) {
  
  const [data, setData] = React.useState<TutorialData>(() => parseData(form.content));
  const [activeMenuIndex, setActiveMenuIndex] = React.useState<number | null>(null);
  const [searchMenu, setSearchMenu] = React.useState("");

  React.useEffect(() => {
    const html = generateHTML(data);
    if (html !== form.content) {
      setForm(prev => ({ ...prev, content: html }));
    }
  }, [data, setForm, form.content]);

  // Update objectives
  const updateObjective = (index: number, val: string) => {
    const newObjs = [...data.objectives];
    newObjs[index] = val;
    setData({ ...data, objectives: newObjs });
  };

  // Update block
  const updateBlock = (id: string, updates: Partial<Block>) => {
    setData(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => b.id === id ? { ...b, ...updates } as Block : b)
    }));
  };

  // Insert block
  const insertBlock = (index: number, type: Block['type']) => {
    const newBlock: Block = type === 'step' 
      ? { id: generateId(), type: 'step', title: '', content: '', code: '', lang: 'Python' }
      : type === 'code'
      ? { id: generateId(), type: 'code', code: '', lang: 'Python' }
      : type === 'image'
      ? { id: generateId(), type: 'image', url: '' }
      : { id: generateId(), type, content: '' } as any;

    const newBlocks = [...data.blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setData({ ...data, blocks: newBlocks });
    setActiveMenuIndex(null);
  };

  // Delete block
  const deleteBlock = (id: string) => {
    setData(prev => ({
      ...prev,
      blocks: prev.blocks.filter(b => b.id !== id)
    }));
  };

  const wordCount = form.content.replace(/<[^>]*>?/gm, " ").trim().split(/\s+/).length || 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 180));

  const steps = data.blocks.filter(b => b.type === 'step');

  return (
    <div className="tutorial-editor-root">
      {/* TOP HEADER */}
      <header className="topbar">
        <div className="top-left">
          <button className="back-btn" onClick={onClose} type="button">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="page-icon">📘</div>
          <div className="page-title">
            <strong>{editing ? "Sửa Tutorial" : "Tạo Tutorial mới"}</strong>
            <span>{form.title || "Chưa có tiêu đề"}</span>
          </div>
          <div className="autosave">
            <span className="autosave-dot"></span> Đã lưu tự động
          </div>
        </div>

        <div className="top-actions">
          <button 
            type="button"
            className="btn"
            onClick={() => window.open(`/posts/${slugify(form.slug || form.title)}`, "_blank")}
          >
            👁 Xem trước
          </button>
          <button 
            type="button"
            className="btn"
            onClick={(e) => {
              setForm({ ...form, published: false });
              onSubmit(e as unknown as React.FormEvent);
            }}
            disabled={submitting}
          >
            Lưu nháp
          </button>
          <button 
            type="button"
            className="btn btn-primary"
            onClick={(e) => onSubmit(e as unknown as React.FormEvent)}
            disabled={submitting}
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 stroke-[3]" />}
            {form.published ? "Lưu thay đổi" : "Xuất bản"}
          </button>
        </div>
      </header>

      <div className="app">
        {/* OUTLINE */}
        <aside className="outline">
          <div className="outline-title">OUTLINE</div>
          <div className="outline-list">
            {steps.map((step, idx) => (
              <button 
                type="button"
                key={step.id} 
                className="outline-item"
                onClick={() => {
                  document.getElementById(`block-${step.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              >
                <span className="outline-number">{(idx + 1).toString().padStart(2, '0')}</span>
                <span className="truncate max-w-[120px] inline-block">{step.title || `Bước ${idx + 1}`}</span>
              </button>
            ))}
            <button type="button" className="outline-item add" onClick={() => insertBlock(data.blocks.length - 1, 'step')}>
              ＋ Thêm section
            </button>
          </div>
        </aside>

        {/* EDITOR AREA */}
        <main className="editor-area">
          <div className="editor-container">
            <div className="type-label">
              <span className="type-dot"></span> TUTORIAL
            </div>

            <input
              className="title-input"
              placeholder="Nhập tiêu đề Tutorial..."
              value={form.title}
              onChange={(e) => onTitleChange(e.target.value)}
            />

            <textarea
              className="description-input"
              placeholder="Mô tả ngắn giúp người đọc hiểu họ sẽ đạt được gì..."
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            />

            <div className="meta">
              <span className="meta-chip">{form.category}</span>
              <span className="meta-chip">{readTime} phút đọc</span>
            </div>

            <div className="divider"></div>

            {/* INTRO PANEL */}
            <section className="intro-panel">
              <div className="panel-kicker">BẠN SẼ HỌC ĐƯỢC GÌ?</div>
              <textarea
                className="intro-textarea"
                placeholder="Viết một đoạn giới thiệu ngắn về bài tutorial này..."
                value={data.intro}
                onChange={(e) => setData({ ...data, intro: e.target.value })}
              />
              <div className="objectives">
                {data.objectives.map((obj, i) => (
                  <div className="objective" key={i}>
                    <span className="objective-check">✓</span>
                    <input 
                      placeholder="Mục tiêu..."
                      value={obj}
                      onChange={(e) => updateObjective(i, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* CONTENT STREAM */}
            <div className="content-stream">
              {data.blocks.map((block, index) => {
                let stepNumber = 0;
                if (block.type === 'step') {
                  stepNumber = data.blocks.filter((b, i) => i <= index && b.type === 'step').length;
                }

                return (
                  <React.Fragment key={block.id}>
                    {/* THE BLOCK */}
                    <div className="block" id={`block-${block.id}`}>
                      <div className="block-actions">
                        <button type="button" className="block-action" onClick={() => deleteBlock(block.id)} title="Xóa block">
                          ✕
                        </button>
                      </div>

                      {block.type === 'paragraph' && (
                        <textarea
                          className="paragraph"
                          placeholder="Viết đoạn văn..."
                          value={block.content}
                          onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                        />
                      )}

                      {block.type === 'heading' && (
                        <input
                          className="heading-input"
                          placeholder="Tiêu đề section..."
                          value={block.content}
                          onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                        />
                      )}

                      {block.type === 'step' && (
                        <div className="step-block">
                          <div className="step-top">
                            <div className="step-badge">{stepNumber.toString().padStart(2, '0')}</div>
                            <input
                              className="step-title"
                              placeholder="Tên bước Tutorial..."
                              value={block.title}
                              onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                            />
                          </div>
                          <textarea
                            className="step-desc"
                            placeholder="Mô tả ngắn về bước này..."
                            value={block.content}
                            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                          />
                          <div className="code-block mt-4">
                            <div className="code-head">
                              <div className="code-left">
                                <span>&lt;/&gt;</span>
                                <span className="code-label">Code</span>
                              </div>
                              <select 
                                className="language" 
                                value={block.lang}
                                onChange={(e) => updateBlock(block.id, { lang: e.target.value })}
                              >
                                <option>Bash</option>
                                <option>Python</option>
                                <option>JavaScript</option>
                                <option>TypeScript</option>
                                <option>C++</option>
                                <option>JSON</option>
                                <option>HTML</option>
                                <option>CSS</option>
                                <option>Go</option>
                                <option>Rust</option>
                              </select>
                            </div>
                            <textarea
                              className="code-area"
                              placeholder="Nhập code..."
                              value={block.code}
                              onChange={(e) => updateBlock(block.id, { code: e.target.value })}
                            />
                          </div>
                        </div>
                      )}

                      {block.type === 'code' && (
                        <div className="code-block">
                          <div className="code-head">
                            <div className="code-left">
                              <span>&lt;/&gt;</span>
                              <span className="code-label">Code</span>
                            </div>
                            <select 
                              className="language" 
                              value={block.lang}
                              onChange={(e) => updateBlock(block.id, { lang: e.target.value })}
                            >
                              <option>Bash</option>
                              <option>Python</option>
                              <option>JavaScript</option>
                              <option>TypeScript</option>
                              <option>C++</option>
                              <option>JSON</option>
                              <option>HTML</option>
                              <option>CSS</option>
                              <option>Go</option>
                              <option>Rust</option>
                            </select>
                          </div>
                          <textarea
                            className="code-area"
                            placeholder="Nhập code..."
                            value={block.code}
                            onChange={(e) => updateBlock(block.id, { code: e.target.value })}
                          />
                        </div>
                      )}

                      {(block.type === 'tip' || block.type === 'warning') && (
                        <div className={`callout ${block.type === 'warning' ? 'warning' : ''}`}>
                          <div className="callout-icon">
                            {block.type === 'tip' ? '💡' : '⚠'}
                          </div>
                          <textarea
                            placeholder={block.type === 'tip' ? 'Mẹo hữu ích...' : 'Cảnh báo...'}
                            value={block.content}
                            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                          />
                        </div>
                      )}

                      {block.type === 'result' && (
                        <div className="result-block">
                          <div className="result-title">KẾT QUẢ</div>
                          <textarea
                            placeholder="Mô tả kết quả đạt được..."
                            value={block.content}
                            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                          />
                        </div>
                      )}

                      {block.type === 'image' && (
                        <div className="image-block">
                          <input 
                            className="w-full bg-transparent border-0 outline-none text-center text-[11px] text-gray-400 mb-2"
                            placeholder="Nhập URL hình ảnh (vd: https://...)"
                            value={block.url}
                            onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                          />
                          <div className="image-placeholder" style={{ background: block.url ? 'transparent' : '' }}>
                            {block.url ? (
                              <img src={block.url} alt="Image" className="max-w-full rounded-md object-contain" />
                            ) : (
                              <>
                                <strong>🖼 Chưa có hình ảnh</strong>
                                Nhập đường dẫn ảnh ở trên
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* INSERT BAR */}
                    <div className="insert-wrap relative">
                      <div className="insert-line">
                        <button 
                          type="button"
                          className="add-block-btn"
                          onClick={() => {
                            setActiveMenuIndex(activeMenuIndex === index ? null : index);
                            setSearchMenu("");
                          }}
                        >
                          ＋
                        </button>
                      </div>

                      {activeMenuIndex === index && (
                        <div className="slash-menu open">
                          <input 
                            className="slash-search" 
                            placeholder="Tìm block..." 
                            value={searchMenu}
                            onChange={(e) => setSearchMenu(e.target.value)}
                            autoFocus
                          />
                          <div className="h-48 overflow-y-auto">
                            <div className="menu-label">BASIC</div>
                            <button type="button" className="menu-item" onClick={() => insertBlock(index, 'paragraph')}>
                              <span className="menu-icon">T</span>
                              <span className="menu-text"><strong>Đoạn văn</strong><span>Viết nội dung thông thường</span></span>
                            </button>
                            <button type="button" className="menu-item" onClick={() => insertBlock(index, 'heading')}>
                              <span className="menu-icon">H</span>
                              <span className="menu-text"><strong>Heading</strong><span>Tiêu đề section</span></span>
                            </button>
                            <div className="menu-label">TUTORIAL</div>
                            <button type="button" className="menu-item" onClick={() => insertBlock(index, 'step')}>
                              <span className="menu-icon">01</span>
                              <span className="menu-text"><strong>Step</strong><span>Tạo một bước hướng dẫn</span></span>
                            </button>
                            <button type="button" className="menu-item" onClick={() => insertBlock(index, 'code')}>
                              <span className="menu-icon">&lt;/&gt;</span>
                              <span className="menu-text"><strong>Code</strong><span>Thêm code có syntax</span></span>
                            </button>
                            <div className="menu-label">CALLOUT</div>
                            <button type="button" className="menu-item" onClick={() => insertBlock(index, 'tip')}>
                              <span className="menu-icon">💡</span>
                              <span className="menu-text"><strong>Tip</strong><span>Mẹo hữu ích</span></span>
                            </button>
                            <button type="button" className="menu-item" onClick={() => insertBlock(index, 'warning')}>
                              <span className="menu-icon">⚠</span>
                              <span className="menu-text"><strong>Warning</strong><span>Cảnh báo quan trọng</span></span>
                            </button>
                            <button type="button" className="menu-item" onClick={() => insertBlock(index, 'result')}>
                              <span className="menu-icon">✓</span>
                              <span className="menu-text"><strong>Result</strong><span>Kết quả của bước</span></span>
                            </button>
                            <div className="menu-label">MEDIA</div>
                            <button type="button" className="menu-item" onClick={() => insertBlock(index, 'image')}>
                              <span className="menu-icon">🖼</span>
                              <span className="menu-text"><strong>Hình ảnh</strong><span>Chèn ảnh từ URL</span></span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            <div className="mt-[30px] p-[20px] border border-dashed border-[#39e6a833] rounded-[13px] text-center">
              <button 
                type="button"
                className="btn btn-primary"
                onClick={() => insertBlock(data.blocks.length - 1, 'step')}
              >
                ＋ Thêm Tutorial Step
              </button>
            </div>
          </div>
        </main>

        {/* RIGHT SETTINGS */}
        <aside className="settings">
          <div className="settings-title">TUTORIAL SETTINGS</div>
          
          <section className="settings-card">
            <div className="settings-card-head">KIỂU BÀI VIẾT</div>
            <div className="settings-body">
              <select 
                className="select mb-2"
                value={form.layout}
                onChange={(e) => setForm({ ...form, layout: e.target.value as "article" | "tutorial" })}
              >
                {POST_LAYOUTS.map(l => (
                  <option key={l.id} value={l.id}>{l.icon} {l.label}</option>
                ))}
              </select>
            </div>
          </section>

          <section className="settings-card">
            <div className="settings-card-head">PHÂN LOẠI</div>
            <div className="settings-body">
              <div className="field">
                <label>CATEGORY</label>
                <select 
                  className="select"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </section>

          <section className="settings-card">
            <div className="settings-card-head">SEO</div>
            <div className="settings-body">
              <div className="field">
                <label>SEO TITLE</label>
                <input 
                  className="input"
                  value={form.seoTitle}
                  onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                />
              </div>
              <div className="field">
                <label>META DESCRIPTION</label>
                <textarea 
                  className="setting-textarea"
                  value={form.seoDescription}
                  onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                />
              </div>
            </div>
          </section>

          <section className="settings-card">
            <div className="settings-card-head">XUẤT BẢN</div>
            <div className="settings-body">
              <div className="setting-row">
                <span>Công khai</span>
                <Switch 
                  checked={form.published}
                  onCheckedChange={(c) => setForm({ ...form, published: c })}
                  className="data-[state=checked]:bg-[#36e2a0]"
                />
              </div>
            </div>
          </section>
        </aside>
      </div>

      <footer className="bottom-bar">
        <div className="stats">
          <strong id="wordCount">{wordCount.toLocaleString()} từ</strong>
          <span> · </span>
          <span id="readTime">~{readTime} phút đọc</span>
          <span> · </span>
          <span style={{ color: "#50b48e" }}>Đã lưu tự động</span>
        </div>
        <div className="footer-actions">
          <button type="button" className="btn" onClick={onClose}>Hủy</button>
          <button type="button" className="btn" onClick={(e) => { setForm({ ...form, published: false }); onSubmit(e as unknown as React.FormEvent); }} disabled={submitting}>Lưu nháp</button>
          <button type="button" className="btn btn-primary" onClick={(e) => onSubmit(e as unknown as React.FormEvent)} disabled={submitting}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 stroke-[3] mr-1" />}
            Lưu Tutorial
          </button>
        </div>
      </footer>
    </div>
  );
}
