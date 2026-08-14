"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import "react-quill-new/dist/quill.snow.css";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table } from "lucide-react";

// Import Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    return function ForwardedQuill({ forwardedRef, ...props }: any) {
      return <RQ ref={forwardedRef} spellCheck={false} {...props} />;
    };
  },
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full" />,
  }
);

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const reactQuillRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);

  // Disable spellcheck to remove red squiggly lines under Vietnamese words
  useEffect(() => {
    const disableSpellCheck = () => {
      if (containerRef.current) {
        const editors = containerRef.current.querySelectorAll('[contenteditable="true"], .ql-editor');
        editors.forEach((el) => {
          if (el.getAttribute("spellcheck") !== "false") {
            el.setAttribute("spellcheck", "false");
            el.setAttribute("autocorrect", "off");
            el.setAttribute("autocapitalize", "off");
          }
        });
      }
    };

    disableSpellCheck();

    const observer = new MutationObserver(() => {
      disableSpellCheck();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    }

    return () => observer.disconnect();
  }, []);

  const insertCustomTable = (r: number, c: number) => {
    if (reactQuillRef.current) {
      const quill = reactQuillRef.current.getEditor();
      const tableModule = quill.getModule("table");
      if (tableModule) {
        tableModule.insertTable(r, c);
        setPopoverOpen(false);
      } else {
        console.error("Table module not found in Quill.");
      }
    }
  };

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ size: ["small", false, "large", "huge"] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ align: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ color: [] }, { background: [] }],
        ["code-block", "code"],
        ["link", "image", "video"],
        ["clean"],
      ],
      table: true,
    }),
    []
  );

  const formats = [
    "header",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "align",
    "list",
    "bullet",
    "color",
    "background",
    "code-block",
    "code",
    "link",
    "image",
    "video",
    "table",
  ];

  return (
    <div ref={containerRef} spellCheck={false} className={`rich-text-editor relative ${className || ""}`}>
      {/* Sticky container pinned at top: 0 alongside .ql-toolbar so button moves synchronously when scrolling */}
      <div className="sticky top-0 z-50 h-0 flex justify-end pr-3 pt-2 pointer-events-none">
        <div className="pointer-events-auto">
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2.5 text-xs font-semibold bg-white dark:bg-[#16221c] border border-gray-200 dark:border-white/10 shadow-xs hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-[#a0afaa]"
              >
                <Table className="h-3.5 w-3.5 mr-1.5 text-[#36e2a0]" />
                Chèn Bảng
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3.5 space-y-3 bg-white dark:bg-[#0e1714] border-gray-200 dark:border-white/10 shadow-xl" align="end">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs flex items-center gap-1.5 text-gray-900 dark:text-white">
                  <Table className="h-4 w-4 text-[#36e2a0]" /> Chèn Bảng tùy chỉnh
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[11px] text-gray-500 dark:text-[#84918b]">Số hàng</Label>
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={rows}
                    onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))}
                    className="h-8 text-xs font-mono bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-gray-500 dark:text-[#84918b]">Số cột</Label>
                  <Input
                    type="number"
                    min={1}
                    max={15}
                    value={cols}
                    onChange={(e) => setCols(Math.max(1, parseInt(e.target.value) || 1))}
                    className="h-8 text-xs font-mono bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-gray-500 dark:text-[#84918b]">Nhanh</Label>
                <div className="flex gap-1">
                  {[
                    { r: 2, c: 2 },
                    { r: 3, c: 3 },
                    { r: 4, c: 4 },
                    { r: 5, c: 3 },
                  ].map((p) => (
                    <Button
                      key={`${p.r}x${p.c}`}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-6 px-1.5 text-[10px] flex-1 font-mono bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10"
                      onClick={() => insertCustomTable(p.r, p.c)}
                    >
                      {p.r}x{p.c}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                type="button"
                size="sm"
                className="w-full h-8 text-xs font-semibold bg-[#36e2a0] text-gray-950 hover:bg-[#2fcb8f]"
                onClick={() => insertCustomTable(rows, cols)}
              >
                Tạo bảng {rows} × {cols}
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <ReactQuill
        forwardedRef={reactQuillRef}
        theme="snow"
        value={value || ""}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />

      <style jsx global>{`
        /* Quill Container & Canvas */
        .rich-text-editor .ql-toolbar {
          position: sticky;
          top: 0;
          z-index: 40;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
          padding: 8px 120px 8px 12px !important;
          transition: background-color 0.2s;
        }
        .rich-text-editor .ql-container {
          min-height: 400px;
          font-family: inherit;
          border: 1px solid #e2e8f0;
          border-top: none;
          border-bottom-left-radius: 0.75rem;
          border-bottom-right-radius: 0.75rem;
          background-color: #ffffff;
        }

        /* Editor Content Typography - LIGHT MODE */
        .rich-text-editor .ql-editor {
          min-height: 400px;
          font-size: 1.05rem;
          line-height: 1.85;
          color: #1e293b;
          padding: 2rem !important;
        }
        .rich-text-editor .ql-editor p {
          color: #334155;
          margin-bottom: 1rem;
        }
        .rich-text-editor .ql-editor h1,
        .rich-text-editor .ql-editor h2,
        .rich-text-editor .ql-editor h3,
        .rich-text-editor .ql-editor h4 {
          color: #0f172a;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .rich-text-editor .ql-editor h1 { font-size: 1.85rem; }
        .rich-text-editor .ql-editor h2 { font-size: 1.5rem; }
        .rich-text-editor .ql-editor h3 { font-size: 1.25rem; }
        .rich-text-editor .ql-editor blockquote {
          border-left: 4px solid #36e2a0;
          padding-left: 1rem;
          color: #64748b;
          font-style: italic;
          margin: 1rem 0;
        }
        .rich-text-editor .ql-editor pre.ql-syntax {
          background-color: #0f172a !important;
          color: #f8fafc !important;
          border-radius: 0.5rem;
          padding: 1rem;
          font-family: monospace;
          font-size: 0.9rem;
        }
        .rich-text-editor .ql-editor code {
          background: #f1f5f9;
          color: #ec4899;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.9em;
        }

        /* DARK MODE STYLES */
        html.dark .rich-text-editor .ql-toolbar {
          background-color: #0c1511;
          border-color: rgba(255, 255, 255, 0.08);
        }
        html.dark .rich-text-editor .ql-container {
          background-color: #070d0a;
          color: #e2e8f0;
          border-color: rgba(255, 255, 255, 0.08);
        }
        html.dark .rich-text-editor .ql-editor {
          color: #e2e8f0 !important;
        }
        html.dark .rich-text-editor .ql-editor p {
          color: #d1d5db !important;
        }
        html.dark .rich-text-editor .ql-editor h1,
        html.dark .rich-text-editor .ql-editor h2,
        html.dark .rich-text-editor .ql-editor h3,
        html.dark .rich-text-editor .ql-editor h4 {
          color: #f8fafc !important;
        }
        html.dark .rich-text-editor .ql-editor blockquote {
          border-left-color: #36e2a0;
          color: #9ca3af !important;
        }
        html.dark .rich-text-editor .ql-editor code {
          background: rgba(255, 255, 255, 0.1);
          color: #f472b6;
        }

        /* Dark Toolbar Icons & Dropdowns */
        html.dark .rich-text-editor .ql-snow .ql-stroke {
          stroke: #94a3b8;
        }
        html.dark .rich-text-editor .ql-snow .ql-fill {
          fill: #94a3b8;
        }
        html.dark .rich-text-editor .ql-snow .ql-picker {
          color: #cbd5e1;
        }
        html.dark .rich-text-editor .ql-snow .ql-picker-options {
          background-color: #0f1c16 !important;
          border-color: rgba(255, 255, 255, 0.15) !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5) !important;
          border-radius: 8px;
          padding: 6px;
        }
        html.dark .rich-text-editor .ql-snow .ql-picker-item {
          color: #cbd5e1 !important;
        }
        html.dark .rich-text-editor .ql-snow .ql-picker-item:hover,
        html.dark .rich-text-editor .ql-snow .ql-picker-item.ql-selected {
          color: #36e2a0 !important;
        }
        html.dark .rich-text-editor .ql-snow button:hover .ql-stroke,
        html.dark .rich-text-editor .ql-snow .ql-active .ql-stroke {
          stroke: #36e2a0 !important;
        }
        html.dark .rich-text-editor .ql-snow button:hover .ql-fill,
        html.dark .rich-text-editor .ql-snow .ql-active .ql-fill {
          fill: #36e2a0 !important;
        }

        /* Tables inside Editor */
        .rich-text-editor table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin: 1.5rem 0;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }
        .rich-text-editor td, .rich-text-editor th {
          border: 1px solid #e2e8f0;
          padding: 10px 14px;
        }
        html.dark .rich-text-editor table {
          border-color: rgba(255, 255, 255, 0.1);
        }
        html.dark .rich-text-editor td, html.dark .rich-text-editor th {
          border-color: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
