"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef } from "react";
import "react-quill-new/dist/quill.snow.css";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Table } from "lucide-react";

// Import Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />,
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const reactQuillRef = useRef<any>(null);

  const insertTable = () => {
    if (reactQuillRef.current) {
      const quill = reactQuillRef.current.getEditor();
      const tableModule = quill.getModule("table");
      if (tableModule) {
        tableModule.insertTable(3, 3);
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
    <div className={`rich-text-editor ${className || ""}`}>
      <div className="flex justify-end mb-2">
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={insertTable}
          className="text-xs h-7 px-2"
        >
          <Table className="h-3.5 w-3.5 mr-1" /> Chèn Bảng 3x3
        </Button>
      </div>
      <ReactQuill
        ref={reactQuillRef}
        theme="snow"
        value={value || ""}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
      <style jsx global>{`
        .rich-text-editor .ql-container {
          min-height: 200px;
          font-family: inherit;
        }
        .rich-text-editor .ql-editor {
          min-height: 200px;
          font-size: 1rem;
        }
        html.dark .rich-text-editor .ql-toolbar {
          background-color: #f8fafc;
          border-color: #e2e8f0;
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
        }
        html.dark .rich-text-editor .ql-container {
          background-color: #ffffff;
          color: #0f172a;
          border-color: #e2e8f0;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
        }
        .rich-text-editor .ql-toolbar {
          position: sticky;
          top: 0;
          z-index: 40;
          background-color: #ffffff;
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
        }
        .rich-text-editor .ql-container {
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
        }
        .rich-text-editor table {
          width: 100%;
          border-collapse: collapse;
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
