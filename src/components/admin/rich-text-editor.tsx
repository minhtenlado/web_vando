"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
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
      return <RQ ref={forwardedRef} {...props} />;
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
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);

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
    <div className={`rich-text-editor relative ${className || ""}`}>
      {/* Sticky container pinned at top: 0 alongside .ql-toolbar so button moves synchronously when scrolling */}
      <div className="sticky top-0 z-50 h-0 flex justify-end pr-2 pt-1.5 pointer-events-none">
        <div className="pointer-events-auto">
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2.5 text-xs font-medium bg-background border border-border shadow-xs hover:bg-accent"
              >
                <Table className="h-3.5 w-3.5 mr-1.5 text-primary" />
                Chèn Bảng
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3.5 space-y-3" align="end">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs flex items-center gap-1.5 text-foreground">
                  <Table className="h-4 w-4 text-primary" /> Chèn Bảng tùy chỉnh
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Số hàng</Label>
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={rows}
                    onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Số cột</Label>
                  <Input
                    type="number"
                    min={1}
                    max={15}
                    value={cols}
                    onChange={(e) => setCols(Math.max(1, parseInt(e.target.value) || 1))}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Nhanh</Label>
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
                      className="h-6 px-1.5 text-[10px] flex-1 font-mono"
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
                className="w-full h-8 text-xs font-medium"
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
        className="flex-1 flex flex-col min-h-0"
      />

      <style jsx global>{`
        .rich-text-editor .ql-toolbar {
          position: sticky;
          top: 0;
          z-index: 40;
          background-color: #ffffff;
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          padding-right: 120px !important;
        }
        .rich-text-editor .ql-container {
          min-height: 200px;
          font-family: inherit;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
        }
        .rich-text-editor .ql-editor {
          min-height: 200px;
          font-size: 1rem;
        }
        html.dark .rich-text-editor .ql-toolbar {
          background-color: #0f172a;
          border-color: #334155;
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
        }
        html.dark .rich-text-editor .ql-container {
          background-color: #020617;
          color: #f8fafc;
          border-color: #334155;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
        }
        html.dark .rich-text-editor .ql-snow .ql-stroke {
          stroke: #94a3b8;
        }
        html.dark .rich-text-editor .ql-snow .ql-fill {
          fill: #94a3b8;
        }
        html.dark .rich-text-editor .ql-snow .ql-picker {
          color: #94a3b8;
        }
        .rich-text-editor table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        .rich-text-editor td, .rich-text-editor th {
          border: 1px solid #cbd5e1;
          padding: 8px;
        }
        html.dark .rich-text-editor td, html.dark .rich-text-editor th {
          border-color: #334155;
        }
      `}</style>
    </div>
  );
}
