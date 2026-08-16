'use client'

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Github,
  ExternalLink,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Maximize2,
  Minimize2,
  ChevronUp,
  Sparkles,
  Cpu,
  Layers,
  Zap,
  ShieldCheck,
  Activity,
  Wifi,
  Play,
  Code,
  Terminal,
  ArrowUpRight,
  BarChart3,
  Radio,
  Wrench,
  Info
} from "lucide-react"
import { SectionHeader } from "./section-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useSiteData } from "@/components/cv/site-data-context"
import type { SiteProject } from "@/lib/cv/site-data-server"
import { useLocale } from "@/components/cv/locale-context"
import { sanitizeHtml } from "@/lib/validation"
import Image from "next/image"

/** Extract YouTube Video ID safely */
function youtubeId(url: string | undefined | null): string | null {
  if (!url || typeof url !== "string") return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  if (/^[\w-]{11}$/.test(url.trim())) return url.trim()
  return null
}

/** Card Fallback SVG Diagram */
function CardSvgFallback({ title, category }: { title: string; category: string }) {
  return (
    <div className="relative w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 overflow-hidden border border-slate-800 select-none">
      <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
        <pattern id={`card-grid-${title.replace(/\s+/g, '-')}`} width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
        </pattern>
        <rect width="100%" height="100%" fill={`url(#card-grid-${title.replace(/\s+/g, '-')})`} />
        <circle cx="20%" cy="30%" r="2" className="fill-primary" />
        <circle cx="80%" cy="70%" r="2" className="fill-cyan-400" />
        <path d="M 50 20 L 150 20 L 200 70" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary/40" />
        <path d="M 300 180 L 220 180 L 180 140" fill="none" stroke="currentColor" strokeWidth="1" className="text-cyan-500/40" />
      </svg>
      <div className="relative z-10 flex flex-col items-center text-center space-y-3">
        <div className="size-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
          <Cpu className="size-6 animate-pulse" />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-mono tracking-widest text-primary/80 uppercase">
            {category || "EMBEDDED SYSTEM"}
          </span>
          <p className="text-xs font-mono text-slate-300 line-clamp-1 max-w-[220px]">
            {title}
          </p>
        </div>
      </div>
      <div className="absolute bottom-2 right-3 text-[9px] font-mono text-slate-500 flex items-center gap-1">
        <Activity className="size-3 text-emerald-400" /> ARCH_DIAGRAM
      </div>
    </div>
  )
}

/** Hero Architecture SVG Diagram */
function HeroArchitectureSvg({ title, category }: { title: string; category: string }) {
  return (
    <div className="relative w-full aspect-video rounded-xl bg-slate-950 border border-slate-800/80 p-4 sm:p-6 overflow-hidden flex flex-col justify-between shadow-2xl group">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

      <div className="relative z-10 flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-mono text-emerald-400 font-semibold tracking-wider uppercase">
            Architecture Overview
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
          IoT · AI · Embedded Stack
        </span>
      </div>

      <div className="relative z-10 my-auto py-4">
        <div className="grid grid-cols-3 gap-3 sm:gap-6 items-center text-center">
          <div className="p-3 sm:p-4 rounded-lg bg-slate-900/90 border border-slate-800 shadow-md flex flex-col items-center space-y-2 hover:border-emerald-500/50 transition-colors">
            <Radio className="size-6 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-slate-200">Sensor & Hardware Layer</span>
            <span className="text-[10px] text-slate-400 font-mono">ADC / SPI / I2C / CAN</span>
          </div>

          <div className="p-3 sm:p-4 rounded-lg bg-emerald-950/40 border border-emerald-500/30 shadow-lg shadow-emerald-500/10 flex flex-col items-center space-y-2 relative">
            <div className="absolute -top-2 bg-emerald-500 text-slate-950 text-[9px] font-mono font-bold px-2 py-0.2 rounded-full">
              CORE MCU
            </div>
            <Cpu className="size-7 text-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-emerald-200">STM32 / ESP32 + RTOS</span>
            <span className="text-[10px] text-emerald-300/80 font-mono">Edge AI Inference</span>
          </div>

          <div className="p-3 sm:p-4 rounded-lg bg-slate-900/90 border border-slate-800 shadow-md flex flex-col items-center space-y-2 hover:border-cyan-500/50 transition-colors">
            <Wifi className="size-6 text-primary" />
            <span className="text-xs font-mono font-bold text-slate-200">Gateway & Cloud Link</span>
            <span className="text-[10px] text-slate-400 font-mono">MQTT / BLE / Wi-Fi</span>
          </div>
        </div>

        <svg className="w-full h-8 mt-2" fill="none" viewBox="0 0 400 30">
          <path d="M 60 15 L 340 15" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="text-emerald-500/50 animate-pulse" />
          <circle cx="200" cy="15" r="4" className="fill-emerald-400" />
        </svg>
      </div>

      <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800/80">
        <span>PROJECT: {title}</span>
        <span>CATEGORY: {category}</span>
      </div>
    </div>
  )
}

/** Visuals Gallery Diagram Fallbacks */
function VisualDiagramSvg({ type, title }: { type: 'system' | 'circuit' | 'ai'; title: string }) {
  if (type === 'circuit') {
    return (
      <div className="relative w-full h-full min-h-[160px] rounded-xl bg-slate-950 border border-slate-800 p-4 flex flex-col justify-between overflow-hidden group hover:border-emerald-500/50 transition-colors select-none">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-slate-800 pb-2">
          <span className="flex items-center gap-1"><Wrench className="size-3 text-emerald-400" /> PCB Schematic & Pinout</span>
          <span>Hardware Diagram</span>
        </div>
        <div className="my-auto flex items-center justify-center py-4">
          <div className="grid grid-cols-4 gap-2 w-full max-w-[200px]">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-6 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-[9px] font-mono text-emerald-400">
                P{i + 1}
              </div>
            ))}
          </div>
        </div>
        <div className="text-[10px] font-mono text-slate-500 text-center">Pin Header & Bus Connectivity</div>
      </div>
    )
  }

  if (type === 'ai') {
    return (
      <div className="relative w-full h-full min-h-[160px] rounded-xl bg-slate-950 border border-slate-800 p-4 flex flex-col justify-between overflow-hidden group hover:border-cyan-500/50 transition-colors select-none">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-slate-800 pb-2">
          <span className="flex items-center gap-1"><Sparkles className="size-3 text-cyan-400" /> Edge AI Pipeline</span>
          <span>INT8 Model</span>
        </div>
        <div className="my-auto flex items-center justify-around py-3">
          <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300">Input</div>
          <span className="text-cyan-400 font-mono text-xs">➔</span>
          <div className="p-2 rounded bg-cyan-950/50 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 font-bold">Tensor Arena</div>
          <span className="text-cyan-400 font-mono text-xs">➔</span>
          <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300">Output</div>
        </div>
        <div className="text-[10px] font-mono text-slate-500 text-center">Optimized Inference Workflow</div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full min-h-[220px] rounded-xl bg-slate-950 border border-slate-800 p-4 flex flex-col justify-between overflow-hidden group hover:border-primary/50 transition-colors select-none">
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-slate-800 pb-2">
        <span className="flex items-center gap-1"><Layers className="size-3 text-primary" /> System Architecture</span>
        <span>{title}</span>
      </div>
      <div className="my-auto flex flex-col items-center justify-center space-y-3 py-4">
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-3">
          <Cpu className="size-6 text-primary" />
          <div>
            <div className="text-xs font-mono font-bold text-slate-200">Embedded Core Controller</div>
            <div className="text-[10px] font-mono text-slate-400">Low-power Real-time Execution</div>
          </div>
        </div>
      </div>
      <div className="text-[10px] font-mono text-slate-500 text-center">Hardware-Software Co-Design</div>
    </div>
  )
}

/** Interactive Fake Play Screen Fallback */
function FakeDemoPlayer({ title }: { title: string }) {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [cpuUsage, setCpuUsage] = React.useState(14)
  const [fps, setFps] = React.useState(60)

  React.useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setCpuUsage(Math.floor(12 + Math.random() * 8))
      setFps(Math.floor(58 + Math.random() * 5))
    }, 600)
    return () => clearInterval(interval)
  }, [isPlaying])

  return (
    <div className="relative w-full aspect-video rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col justify-between shadow-2xl group select-none">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-[11px] font-mono text-slate-300">
        <div className="flex items-center gap-2">
          <Terminal className="size-4 text-emerald-400" />
          <span className="font-bold text-slate-200">DEMO TELEMETRY SIMULATOR</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Activity className="size-3 text-emerald-400 animate-pulse" />
            {isPlaying ? "RUNNING" : "READY"}
          </span>
          <span>FPS: {isPlaying ? fps : "--"}</span>
          <span>CPU: {isPlaying ? `${cpuUsage}%` : "--"}</span>
        </div>
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

        {isPlaying ? (
          <div className="relative z-10 flex flex-col items-center space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-1.5 h-12">
              {[40, 70, 30, 90, 50, 80, 60, 100, 45, 75, 85, 35].map((h, idx) => (
                <motion.div
                  key={idx}
                  className="w-1.5 bg-emerald-400 rounded-full"
                  animate={{ height: isPlaying ? [h * 0.3, h * 0.9, h * 0.4] : 10 }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: idx * 0.05 }}
                />
              ))}
            </div>
            <div className="space-y-1 font-mono text-xs text-emerald-300">
              <p className="font-semibold">[LIVE] Executing Real-time Edge Loop...</p>
              <p className="text-slate-400 text-[11px]">Processing sensor payloads @ 1000Hz • Zero frame drops</p>
            </div>
          </div>
        ) : (
          <div className="relative z-10 flex flex-col items-center space-y-3">
            <button
              onClick={() => setIsPlaying(true)}
              className="size-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-all hover:scale-110 shadow-lg shadow-emerald-500/20"
            >
              <Play className="size-8 ml-1 fill-current" />
            </button>
            <div className="space-y-0.5">
              <p className="text-xs font-mono font-semibold text-slate-200">Interactive Demo Simulation</p>
              <p className="text-[11px] font-mono text-slate-400">Click to start live execution simulation</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-t border-slate-800 text-[10px] font-mono text-slate-400">
        <span>PROJECT: {title}</span>
        {isPlaying && (
          <button
            onClick={() => setIsPlaying(false)}
            className="text-amber-400 hover:underline flex items-center gap-1"
          >
            Pause Simulation
          </button>
        )}
      </div>
    </div>
  )
}

export function Projects() {
  const { projects, profile } = useSiteData()
  const { t } = useLocale()
  const [lightbox, setLightbox] = React.useState<{ list: string[]; index: number } | null>(null)
  const [activeProject, setActiveProject] = React.useState<SiteProject | null>(null)
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false)
  const [scrollProgress, setScrollProgress] = React.useState<number>(0)
  const [activeSection, setActiveSection] = React.useState<string>("overview")

  const modalScrollRef = React.useRef<HTMLDivElement>(null)
  const activeYtId = activeProject?.youtubeUrl ? youtubeId(activeProject.youtubeUrl) : null

  // Handle modal scrolling, progress bar & TOC ScrollSpy
  const handleModalScroll = React.useCallback(() => {
    if (!modalScrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = modalScrollRef.current
    const totalScroll = scrollHeight - clientHeight
    if (totalScroll > 0) {
      const progress = Math.min(100, Math.max(0, (scrollTop / totalScroll) * 100))
      setScrollProgress(progress)
    } else {
      setScrollProgress(0)
    }

    const sectionIds = ["overview", "responsibility", "gallery", "demo", "results"]
    const scrollPos = scrollTop + 180
    for (let i = sectionIds.length - 1; i >= 0; i--) {
      const secEl = document.getElementById(sectionIds[i])
      if (secEl && secEl.offsetTop <= scrollPos) {
        setActiveSection(sectionIds[i])
        break
      }
    }
  }, [])

  // Smooth scroll to section inside modal
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
      setActiveSection(id)
    }
  }

  // Smooth scroll to top of modal
  const scrollToTop = () => {
    if (modalScrollRef.current) {
      modalScrollRef.current.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // Keyboard Navigation: Escape to close modal/lightbox, P key to open featured project
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      try {
        if (e.key === "Escape") {
          if (lightbox) setLightbox(null)
          else if (activeProject) setActiveProject(null)
        }

        // 'P' or 'p' key shortcut to open featured project if no modal open
        if ((e.key === "p" || e.key === "P") && !activeProject && !lightbox) {
          const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase()
          if (targetTag !== "input" && targetTag !== "textarea" && !(e.target as HTMLElement)?.isContentEditable) {
            if (projects.length > 0) {
              setActiveProject(projects[0])
            }
          }
        }

        if (lightbox) {
          if (e.key === "ArrowLeft" && lightbox.index > 0) {
            setLightbox({ ...lightbox, index: lightbox.index - 1 })
          }
          if (e.key === "ArrowRight" && lightbox.index < lightbox.list.length - 1) {
            setLightbox({ ...lightbox, index: lightbox.index + 1 })
          }
        }
      } catch {
        // Silently capture keyboard event edge cases
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [lightbox, activeProject, projects])

  // Lock body scroll when modal or lightbox is active
  React.useEffect(() => {
    if (lightbox || activeProject) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [lightbox, activeProject])

  // Prepare fallback data for active project
  const yearText = activeProject?.year || "2025 — 2026"
  const roleText = activeProject?.role || "AIoT Engineer"
  const highlightText = activeProject?.highlight || "Edge AI & Embedded RTOS"
  const projectTypeText = activeProject?.projectType || activeProject?.category || "Research & Development"

  const responsibilitiesList = activeProject?.responsibilities && activeProject.responsibilities.length > 0
    ? activeProject.responsibilities
    : (activeProject?.features && activeProject.features.length > 0
        ? activeProject.features.map((feat, idx) => {
            const titles = [
              t("Kiến trúc Firmware", "Firmware Architecture"),
              t("Tối ưu hóa Mô hình Edge AI", "Edge AI Optimization"),
              t("Tích hợp Phần cứng & Cảm biến", "Hardware & Sensor Integration"),
              t("Giao thức Truyền dữ liệu", "Communication Protocols"),
              t("Kiểm định & Debugging", "Testing & Debugging"),
            ]
            return {
              icon: [Cpu, Sparkles, Wrench, Wifi, ShieldCheck][idx % 5],
              title: titles[idx % titles.length],
              subtitle: feat
            }
          })
        : [
            {
              icon: Cpu,
              title: t("Thiết kế Hệ thống Nhúng", "Embedded System Design"),
              subtitle: t("Phát triển Firmware cho vi điều khiển STM32/ESP32 với FreeRTOS.", "Firmware development for STM32/ESP32 microcontrollers with FreeRTOS.")
            },
            {
              icon: Sparkles,
              title: t("Tối ưu Edge AI", "Edge AI Optimization"),
              subtitle: t("Triển khai mô hình suy luận trí tuệ nhân tạo offline trên thiết bị nhúng.", "Deploying offline AI inference models directly on embedded hardware.")
            },
            {
              icon: Wifi,
              title: t("Giao tiếp & Kết nối Mạng", "Network Communication"),
              subtitle: t("Tích hợp các giao thức IoT như MQTT, CoAP, BLE và LoRaWAN.", "Integrating IoT communication protocols including MQTT, CoAP, BLE, and LoRaWAN.")
            }
          ]
      )

  const resultsList = activeProject?.results && activeProject.results.length > 0
    ? activeProject.results
    : [
        { value: "93.0%", label: t("Độ chính xác mô hình", "Model Accuracy"), sub: t("Xử lý suy luận Edge AI", "Edge AI inference") },
        { value: "< 2s", label: t("Độ trễ phản hồi", "Response Latency"), sub: t("Thời gian đáp ứng thực tế", "Real-time execution speed") },
        { value: "5+ Nodes", label: t("Quy mô kết nối", "Mesh Node Scale"), sub: t("Mạng cảm biến diện rộng", "Sensor network coverage") },
        { value: "Edge AI", label: t("Kiến trúc xử lý", "Processing Mode"), sub: t("Vận hành offline hoàn toàn", "Full offline operation") },
      ]

  return (
    <section id="projects" className="py-8 sm:py-12 scroll-mt-16 md:scroll-mt-20 bg-muted/20">
      <div className="container mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12">
        <SectionHeader
          index="04 / projects"
          title={t("Dự án tiêu biểu", "Featured Projects")}
          subtitle=""
        />

        <div className="mt-10 grid md:grid-cols-2 gap-6">
          {projects.map((p, i) => {
            const hasValidImage = p.image && typeof p.image === "string" && p.image.trim().length > 0 && !p.image.endsWith(".svg")

            return (
              <motion.div
                key={p.id ?? p.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
              >
                <Card className="group h-full overflow-hidden border border-border bg-card hover:border-primary/60 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col justify-between">
                  <div>
                    {/* Image / SVG Diagram Header */}
                    <div className="relative aspect-[16/9] overflow-hidden bg-slate-950 border-b border-border/50">
                      {hasValidImage ? (
                        <Image
                          fill
                          src={p.image}
                          alt={t(`Ảnh minh họa dự án ${p.title}`, `Project image for ${p.title}`)}
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <CardSvgFallback title={p.title} category={p.category} />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-3 right-3 flex gap-2">
                        <Badge className="bg-black/80 text-primary border border-primary/40 font-mono text-[11px] backdrop-blur-md px-2.5 py-0.5 shadow-md">
                          {p.category}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-1">
                          {p.title}
                        </h3>
                      </div>
                      <div
                        className="text-sm text-muted-foreground leading-relaxed line-clamp-3 ql-editor-display prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(p.description || "") }}
                      />

                      {/* Tech stack badges */}
                      {p.tech && p.tech.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {p.tech.slice(0, 4).map((item, ti) => (
                            <span key={ti} className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/40">
                              {item}
                            </span>
                          ))}
                          {p.tech.length > 4 && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/40 text-muted-foreground">
                              +{p.tech.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </div>

                  <div className="p-5 pt-0">
                    <Button
                      variant="ghost"
                      className="w-full justify-between border border-primary/30 bg-primary/5 hover:bg-primary hover:text-primary-foreground text-primary font-semibold transition-all duration-200 group/btn shadow-sm"
                      onClick={() => setActiveProject(p)}
                    >
                      <span>{t("Xem chi tiết ↗", "View Case Study ↗")}</span>
                      <ArrowUpRight className="size-4 ml-2 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <Button asChild variant="outline" size="lg" className="border-border hover:border-primary">
            <a
              href={`https://${profile.github}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-4 w-4 mr-2" /> {t("Xem thêm trên GitHub", "View more on GitHub")}
            </a>
          </Button>
        </div>
      </div>

      {/* Modern Case Study Modal */}
      <AnimatePresence>
        {activeProject && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={activeProject.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveProject(null)}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-xl flex items-center justify-center p-0 sm:p-4 md:p-6 lg:p-8"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative bg-background border border-border/80 shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
                isFullscreen
                  ? "w-full h-full rounded-none border-0"
                  : "w-full max-w-6xl h-[92vh] max-h-[920px] rounded-2xl"
              }`}
            >
              {/* Progress Bar (#progress) at Top of Modal */}
              <div className="absolute top-0 inset-x-0 h-1 bg-muted/30 z-30 overflow-hidden">
                <div
                  id="progress"
                  className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-primary transition-all duration-150"
                  style={{ width: `${scrollProgress}%` }}
                />
              </div>

              {/* Sticky Header with Back, Breadcrumb, Fullscreen, Close */}
              <div className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-background/90 backdrop-blur-md border-b border-border/60">
                {/* Left: Back button & Breadcrumb */}
                <div className="flex items-center gap-3 overflow-hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveProject(null)}
                    className="h-8 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 gap-1.5 shrink-0"
                  >
                    <ArrowLeft className="size-4" />
                    <span className="hidden sm:inline">{t("Quay lại", "Back")}</span>
                  </Button>
                  <div className="h-4 w-px bg-border/60 shrink-0" />
                  <div className="text-xs font-mono text-muted-foreground truncate flex items-center gap-1.5">
                    <span className="text-primary font-semibold">{t("Project Case Study", "Case Study")}</span>
                    <span>/</span>
                    <span className="text-foreground font-medium truncate">{activeProject.title}</span>
                  </div>
                </div>

                {/* Right: Fullscreen Toggle & Close Button */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    aria-label={isFullscreen ? t("Thu nhỏ", "Minimize") : t("Toàn màn hình", "Fullscreen")}
                    title={isFullscreen ? t("Thu nhỏ", "Minimize") : t("Toàn màn hình", "Fullscreen")}
                    className="grid place-items-center h-8 w-8 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  >
                    {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                  </button>
                  <button
                    onClick={() => setActiveProject(null)}
                    aria-label={t("Đóng", "Close")}
                    title={t("Đóng (ESC)", "Close (ESC)")}
                    className="grid place-items-center h-8 w-8 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content Container (modal-scroll) */}
              <div
                id="modal-scroll"
                ref={modalScrollRef}
                onScroll={handleModalScroll}
                className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth p-4 sm:p-6 lg:p-8 space-y-10"
              >
                {/* HERO SECTION */}
                <div className="space-y-6">
                  {/* Category Kicker */}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs text-primary border-primary/40 bg-primary/5 uppercase tracking-wider px-3 py-1">
                      <Sparkles className="size-3 mr-1.5 animate-pulse" />
                      {activeProject.category || "IoT · AI · Embedded Systems"}
                    </Badge>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="space-y-2">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                      {activeProject.title}
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
                      {t(
                        "Chi tiết kiến trúc kỹ thuật, giải pháp tối ưu hệ thống nhúng và kết quả triển khai.",
                        "Technical architecture details, embedded optimization, and deployment results."
                      )}
                    </p>
                  </div>

                  {/* Meta Pills */}
                  <div className="flex flex-wrap gap-2 sm:gap-3 text-xs font-mono">
                    <div className="px-3 py-1.5 rounded-lg bg-muted/60 border border-border/60 text-muted-foreground flex items-center gap-1.5">
                      <span className="text-slate-400">{t("Năm:", "Year:")}</span>
                      <span className="text-foreground font-semibold">{yearText}</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-muted/60 border border-border/60 text-muted-foreground flex items-center gap-1.5">
                      <span className="text-slate-400">{t("Vai trò:", "Role:")}</span>
                      <span className="text-foreground font-semibold">{roleText}</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-muted/60 border border-border/60 text-muted-foreground flex items-center gap-1.5">
                      <span className="text-slate-400">{t("Điểm nổi bật:", "Highlight:")}</span>
                      <span className="text-primary font-semibold">{highlightText}</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-muted/60 border border-border/60 text-muted-foreground flex items-center gap-1.5">
                      <span className="text-slate-400">{t("Loại dự án:", "Type:")}</span>
                      <span className="text-foreground font-semibold">{projectTypeText}</span>
                    </div>
                  </div>

                  {/* Hero Media / Diagram Fallback */}
                  {activeProject.image && !activeProject.image.endsWith(".svg") ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-border/80 shadow-2xl bg-slate-950 group">
                      <Image
                        fill
                        src={activeProject.image}
                        alt={activeProject.title}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-3 right-3 text-[11px] font-mono text-white/80 bg-black/70 px-2.5 py-1 rounded border border-white/20 backdrop-blur-md">
                        {t("Architecture Overview", "Architecture Overview")}
                      </div>
                    </div>
                  ) : (
                    <HeroArchitectureSvg title={activeProject.title} category={activeProject.category} />
                  )}
                </div>

                {/* 2-COLUMN CONTENT LAYOUT (Article + Sticky Sidebar) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 pt-4">
                  {/* Left Column: Article Content (8 cols) */}
                  <div className="lg:col-span-8 space-y-12">
                    {/* SECTION 01: OVERVIEW */}
                    <section id="overview" className="scroll-mt-24 space-y-4">
                      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                        <span className="text-xs font-mono text-primary font-bold tracking-widest uppercase">01 · Overview</span>
                        <h2 className="text-xl font-bold text-foreground">{t("Tổng quan dự án", "Project Overview")}</h2>
                      </div>

                      <div
                        className="text-base text-foreground/90 leading-relaxed ql-editor-display prose prose-slate dark:prose-invert max-w-none space-y-4"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(activeProject.description || "") }}
                      />

                      {/* Highlight Callout Box */}
                      <div className="p-4 sm:p-5 rounded-xl bg-primary/5 border border-primary/20 flex gap-4 items-start shadow-sm">
                        <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                          <Zap className="size-5" />
                        </div>
                        <div className="space-y-1 text-sm">
                          <h4 className="font-bold text-foreground">{t("Mục tiêu kỹ thuật cốt lõi", "Core Engineering Goal")}</h4>
                          <p className="text-muted-foreground leading-relaxed">
                            {t(
                              "Tối ưu hóa độ trễ tính toán, đảm bảo khả năng vận hành offline tin cậy trong môi trường nhúng với nguồn tài nguyên phần cứng giới hạn.",
                              "Optimizing computational latency and ensuring reliable offline operation in resource-constrained embedded environments."
                            )}
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* SECTION 02: RESPONSIBILITIES */}
                    <section id="responsibility" className="scroll-mt-24 space-y-4">
                      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                        <span className="text-xs font-mono text-primary font-bold tracking-widest uppercase">02 · Responsibilities</span>
                        <h2 className="text-xl font-bold text-foreground">{t("Vai trò & Trách nhiệm", "Key Responsibilities")}</h2>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        {responsibilitiesList.map((item, idx) => {
                          const IconComp = item.icon || CheckCircle2
                          return (
                            <div key={idx} className="p-4 rounded-xl bg-card border border-border/60 hover:border-primary/40 transition-all space-y-2 shadow-sm">
                              <div className="flex items-center gap-2.5 text-primary">
                                <div className="p-2 rounded-lg bg-primary/10">
                                  <IconComp className="size-4" />
                                </div>
                                <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed pl-0.5">
                                {item.subtitle}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    </section>

                    {/* SECTION 03: VISUALS & ARCHITECTURE */}
                    <section id="gallery" className="scroll-mt-24 space-y-4">
                      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                        <span className="text-xs font-mono text-primary font-bold tracking-widest uppercase">03 · Visuals</span>
                        <h2 className="text-xl font-bold text-foreground">{t("Hình ảnh & Sơ đồ kiến trúc", "Visuals & Architecture")}</h2>
                      </div>

                      {/* Gallery Grid (1 large + 2 stacked small images/diagrams) */}
                      {activeProject.images && activeProject.images.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <button
                            onClick={() => setLightbox({ list: activeProject.images!, index: 0 })}
                            className="sm:col-span-2 group relative aspect-video rounded-xl overflow-hidden border border-border/80 hover:border-primary transition-all bg-slate-950"
                          >
                            <Image
                              fill
                              src={activeProject.images[0]}
                              alt="Gallery Main"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            <span className="absolute bottom-2 left-2 text-[10px] font-mono text-white/90 bg-black/70 px-2 py-0.5 rounded backdrop-blur-md">
                              {t("Ảnh chính 1/3", "Main Image 1/3")}
                            </span>
                          </button>

                          <div className="flex sm:flex-col gap-3">
                            {activeProject.images.slice(1, 3).map((img, imgIdx) => (
                              <button
                                key={imgIdx + 1}
                                onClick={() => setLightbox({ list: activeProject.images!, index: imgIdx + 1 })}
                                className="flex-1 group relative aspect-video rounded-xl overflow-hidden border border-border/80 hover:border-primary transition-all bg-slate-950"
                              >
                                <Image
                                  fill
                                  src={img}
                                  alt={`Gallery ${imgIdx + 2}`}
                                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2">
                            <VisualDiagramSvg type="system" title={activeProject.title} />
                          </div>
                          <div className="flex sm:flex-col gap-3">
                            <VisualDiagramSvg type="circuit" title={activeProject.title} />
                            <VisualDiagramSvg type="ai" title={activeProject.title} />
                          </div>
                        </div>
                      )}
                    </section>

                    {/* SECTION 04: DEMO VIDEO */}
                    <section id="demo" className="scroll-mt-24 space-y-4">
                      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                        <span className="text-xs font-mono text-primary font-bold tracking-widest uppercase">04 · Demo</span>
                        <h2 className="text-xl font-bold text-foreground">{t("Video & Thử nghiệm Demo", "Video & Live Demo")}</h2>
                      </div>

                      {activeProject.youtubeUrl && activeYtId ? (
                        <div className="relative aspect-video rounded-xl overflow-hidden border border-border/80 bg-black shadow-2xl">
                          <iframe
                            src={`https://www.youtube.com/embed/${activeYtId}?rel=0`}
                            title="YouTube video demo"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0 h-full w-full"
                          />
                        </div>
                      ) : (
                        <FakeDemoPlayer title={activeProject.title} />
                      )}
                    </section>

                    {/* SECTION 05: RESULTS & METRICS */}
                    <section id="results" className="scroll-mt-24 space-y-4">
                      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                        <span className="text-xs font-mono text-primary font-bold tracking-widest uppercase">05 · Results</span>
                        <h2 className="text-xl font-bold text-foreground">{t("Kết quả & Hiệu năng", "Results & Impact")}</h2>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        {resultsList.map((res, rIdx) => (
                          <div key={rIdx} className="p-4 rounded-xl bg-card border border-border/60 space-y-1 shadow-sm flex flex-col justify-between">
                            <div className="text-xl sm:text-2xl font-extrabold text-primary font-mono tracking-tight">
                              {res.value}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-foreground">{res.label}</div>
                              {res.sub && <div className="text-[10px] font-mono text-muted-foreground">{res.sub}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  {/* Right Column: Sticky Sidebar (4 cols) */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="sticky top-6 space-y-6">
                      {/* Table of Contents (TOC) with scrollSpy */}
                      <div className="p-4 sm:p-5 rounded-xl bg-card border border-border/60 space-y-3 shadow-sm">
                        <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                          <BarChart3 className="size-4 text-primary" />
                          {t("Mục lục Case Study", "Table of Contents")}
                        </h3>
                        <nav className="space-y-1 text-xs font-medium">
                          {[
                            { id: "overview", label: t("01. Tổng quan", "01. Overview") },
                            { id: "responsibility", label: t("02. Trách nhiệm", "02. Responsibilities") },
                            { id: "gallery", label: t("03. Visuals & Sơ đồ", "03. Visuals & Architecture") },
                            { id: "demo", label: t("04. Video Demo", "04. Video Demo") },
                            { id: "results", label: t("05. Kết quả", "05. Results & Metrics") },
                          ].map((item) => (
                            <button
                              key={item.id}
                              onClick={() => scrollToSection(item.id)}
                              className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center justify-between ${
                                activeSection === item.id
                                  ? "bg-primary/10 text-primary font-bold border-l-2 border-primary"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                              }`}
                            >
                              <span>{item.label}</span>
                              {activeSection === item.id && <span className="size-1.5 rounded-full bg-primary" />}
                            </button>
                          ))}
                        </nav>
                      </div>

                      {/* Tech Stack Pills List */}
                      {activeProject.tech && activeProject.tech.length > 0 && (
                        <div className="p-4 sm:p-5 rounded-xl bg-card border border-border/60 space-y-3 shadow-sm">
                          <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                            <Code className="size-4 text-primary" />
                            {t("Công nghệ sử dụng", "Tech Stack")}
                          </h3>
                          <div className="flex flex-wrap gap-1.5">
                            {activeProject.tech.map((item, ti) => (
                              <Badge key={ti} variant="secondary" className="px-2.5 py-1 text-xs font-mono bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Role & Project Summary Box */}
                      <div className="p-4 sm:p-5 rounded-xl bg-muted/30 border border-border/60 space-y-3 text-xs">
                        <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                          <Info className="size-4 text-primary" />
                          {t("Tóm tắt dự án", "Project Summary")}
                        </h3>
                        <div className="space-y-2 text-muted-foreground">
                          <div className="flex justify-between border-b border-border/40 pb-1.5">
                            <span>{t("Tác giả", "Author")}</span>
                            <span className="font-semibold text-foreground">{profile.name}</span>
                          </div>
                          <div className="flex justify-between border-b border-border/40 pb-1.5">
                            <span>{t("Danh mục", "Category")}</span>
                            <span className="font-semibold text-foreground">{activeProject.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t("Trạng thái", "Status")}</span>
                            <span className="font-semibold text-emerald-400">{t("Hoàn thành", "Completed")}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer with Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-t border-border/60 bg-muted/30 text-xs">
                <span className="text-muted-foreground font-mono">
                  {profile.name} · Portfolio Case Study
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={scrollToTop}
                    className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <ChevronUp className="size-3.5 mr-1" />
                    {t("↑ Về đầu", "↑ Scroll Top")}
                  </Button>

                  {activeProject.repo && (
                    <Button asChild variant="outline" size="sm" className="h-8 text-xs font-medium">
                      <a href={activeProject.repo} target="_blank" rel="noopener noreferrer">
                        <Github className="size-3.5 mr-1.5" />
                        {t("GitHub ↗", "GitHub ↗")}
                      </a>
                    </Button>
                  )}

                  {activeProject.link && (
                    <Button asChild size="sm" className="h-8 text-xs font-semibold">
                      <a href={activeProject.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="size-3.5 mr-1.5" />
                        {t("Demo ↗", "Demo ↗")}
                      </a>
                    </Button>
                  )}

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setActiveProject(null)}
                    className="h-8 text-xs font-medium"
                  >
                    {t("Đóng", "Close")}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md grid place-items-center p-4 sm:p-8"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-6xl max-h-full w-full h-full flex flex-col items-center justify-center"
            >
              <button
                onClick={() => setLightbox(null)}
                aria-label={t("Đóng ảnh", "Close image")}
                className="absolute top-0 right-0 z-20 grid place-items-center h-10 w-10 rounded-full bg-background/50 backdrop-blur border border-border hover:bg-muted transition-colors text-foreground"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="relative w-full h-full p-4 flex items-center justify-center group/lb">
                <Image
                  fill
                  key={lightbox.index}
                  src={lightbox.list[lightbox.index]}
                  alt="Gallery full size"
                  className="object-contain rounded-md shadow-2xl border border-border/20 animate-in fade-in zoom-in-95 duration-200"
                />

                {lightbox.index > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setLightbox({ ...lightbox, index: lightbox.index - 1 })
                    }}
                    aria-label={t("Ảnh trước", "Previous image")}
                    className="absolute left-0 sm:left-4 z-20 grid place-items-center h-12 w-12 rounded-full bg-background/50 backdrop-blur border border-border hover:bg-muted transition-all opacity-80 sm:opacity-0 sm:group-hover/lb:opacity-100 text-foreground"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                )}

                {lightbox.index < lightbox.list.length - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setLightbox({ ...lightbox, index: lightbox.index + 1 })
                    }}
                    aria-label={t("Ảnh kế tiếp", "Next image")}
                    className="absolute right-0 sm:right-4 z-20 grid place-items-center h-12 w-12 rounded-full bg-background/50 backdrop-blur border border-border hover:bg-muted transition-all opacity-80 sm:opacity-0 sm:group-hover/lb:opacity-100 text-foreground"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                )}

                <div className="absolute bottom-0 inset-x-0 p-4 text-center text-sm font-mono text-muted-foreground opacity-80 sm:opacity-0 sm:group-hover/lb:opacity-100 transition-opacity">
                  {lightbox.index + 1} / {lightbox.list.length}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
