'use client'

import * as React from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import { motion, AnimatePresence } from "framer-motion"
import { Code2, Copy, Check, FileCode2, Terminal } from "lucide-react"
import { SectionHeader } from "./section-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { codeSnippets } from "@/lib/cv/data"
import { cn } from "@/lib/utils"

export function CodeShowcase() {
  const { toast } = useToast()
  const [activeId, setActiveId] = React.useState(codeSnippets[0].id)
  const [copied, setCopied] = React.useState(false)

  const active = codeSnippets.find((s) => s.id === activeId) ?? codeSnippets[0]

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(active.code)
      setCopied(true)
      toast({ title: "Đã sao chép", description: `Mã nguồn ${active.filename} đã vào clipboard.` })
      setTimeout(() => setCopied(false), 1600)
    } catch {
      toast({
        title: "Không thể sao chép",
        description: "Trình duyệt không hỗ trợ clipboard.",
        variant: "destructive",
      })
    }
  }

  return (
    <section id="code" className="relative py-20 sm:py-28">
      <div className="container mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12">
        <SectionHeader
          index="05 / code"
          title="Sản phẩm code"
          subtitle="Vài đoạn code thực tế từ các dự án tôi đã làm — viết sạch, có chú thích, tuân thủ MISRA-C và tối ưu cho vi điều khiển có tài nguyên hạn chế."
        />

        <div className="mt-10 grid lg:grid-cols-[280px_1fr] gap-6">
          {/* File list */}
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {codeSnippets.map((s) => {
              const isActive = s.id === activeId
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveId(s.id)}
                  className={cn(
                    "group flex items-start gap-3 rounded-lg border p-3 text-left transition-all shrink-0 lg:w-full",
                    isActive
                      ? "border-primary/50 bg-primary/5"
                      : "border-border/60 bg-card/40 hover:border-primary/30 hover:bg-muted/40"
                  )}
                >
                  <span
                    className={cn(
                      "grid place-items-center h-9 w-9 rounded-md border shrink-0 transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "bg-background text-muted-foreground border-border group-hover:text-primary"
                    )}
                  >
                    <FileCode2 className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "font-mono text-sm truncate",
                        isActive ? "text-primary font-semibold" : "font-medium"
                      )}
                    >
                      {s.filename}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {s.title}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Code viewer */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <Card className="overflow-hidden border-border/60 bg-card/40 backdrop-blur">
              {/* Window chrome */}
              <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-border/60 bg-muted/30">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex gap-1.5 shrink-0">
                    <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                    <span className="h-2.5 w-2.5 rounded-full bg-accent/60" />
                    <span className="h-2.5 w-2.5 rounded-full bg-primary/60" />
                  </div>
                  <span className="font-mono text-xs text-muted-foreground truncate ml-2">
                    <Terminal className="inline h-3 w-3 mr-1" />
                    ~/src/{active.filename}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="font-mono text-[10px] hidden sm:inline-flex">
                    {active.language.toUpperCase()}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopy}
                    className="h-7 gap-1.5 text-xs"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-primary" /> Đã chép
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Sao chép
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Description bar */}
              <div className="px-4 py-2.5 border-b border-border/60 bg-background/40">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <Code2 className="inline h-3.5 w-3.5 mr-1.5 text-primary align-text-bottom" />
                  {active.description}
                </p>
              </div>

              {/* Code */}
              <div className="relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-x-auto"
                  >
                    <SyntaxHighlighter
                      language={active.language}
                      style={vscDarkPlus}
                      showLineNumbers
                      customStyle={{
                        margin: 0,
                        padding: "1.25rem",
                        background: "transparent",
                        fontSize: "0.8rem",
                        lineHeight: 1.6,
                      }}
                      lineNumberStyle={{
                        color: "oklch(0.5 0.02 200)",
                        minWidth: "2.5em",
                        paddingRight: "1em",
                        userSelect: "none",
                      }}
                      codeTagProps={{
                        style: { fontFamily: "var(--font-jetbrains-mono), monospace" },
                      }}
                    >
                      {active.code}
                    </SyntaxHighlighter>
                  </motion.div>
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
