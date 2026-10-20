'use client'

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import {
  ArrowLeft,
  Github,
  ExternalLink,
  Share2,
  Check,
  Calendar,
  Tag,
  Sparkles,
  Zap,
  Cpu,
  Code,
  Layers,
  ShieldCheck,
  Wifi,
  Wrench,
  BarChart3,
  ChevronUp,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  CheckCircle2,
  FolderOpen,
  ArrowUpRight,
  Terminal,
} from "lucide-react"
import { sanitizeHtml } from "@/lib/validation"
import type { SiteProject } from "@/lib/cv/site-data-server"
import { normalizeProjectUrl } from "@/lib/cv/project-input"
import "./detail-polish.css"

interface ProjectDetailViewProps {
  project: SiteProject
  relatedProjects: SiteProject[]
}

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

function isSupportedProjectImage(src?: string | null): src is string {
  if (!src) return false
  if (src.startsWith("/") && !src.startsWith("//")) return true
  try {
    const url = new URL(src)
    return url.protocol === "https:" && (
      url.hostname === "res.cloudinary.com" ||
      url.hostname.endsWith(".public.blob.vercel-storage.com")
    )
  } catch {
    return false
  }
}

function ProjectMediaImage({
  src,
  alt,
  fallbackLabel,
  sizes,
  className = "object-contain",
  priority = false,
}: {
  src: string;
  alt: string;
  fallbackLabel: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = React.useState(false);
  if (failed) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#101a27] p-6 text-center" role="img" aria-label={`${alt}: image unavailable`}>
        <Cpu className="size-12 text-[#66d9e8]" aria-hidden="true" />
        <span className="font-semibold text-[#f1f5f9]">{fallbackLabel}</span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#a8b5c6]">Media unavailable</span>
      </div>
    );
  }
  return <Image fill sizes={sizes} src={src} alt={alt} className={className} priority={priority} onError={() => setFailed(true)} />;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  cpu: Cpu,
  layers: Layers,
  zap: Zap,
  code: Code,
  wifi: Wifi,
  shieldcheck: ShieldCheck,
  wrench: Wrench,
  sparkles: Sparkles,
  terminal: Terminal,
  chart: BarChart3,
}

function resolveIcon(name?: string) {
  if (!name) return CheckCircle2
  return ICON_MAP[name.toLowerCase()] || CheckCircle2
}

export function ProjectDetailView({
  project,
  relatedProjects,
}: ProjectDetailViewProps) {
  const [copied, setCopied] = React.useState(false)
  const [scrollProgress, setScrollProgress] = React.useState(0)
  const [activeSection, setActiveSection] = React.useState("overview")
  const [lightbox, setLightbox] = React.useState<{ list: string[]; index: number } | null>(null)
  const lightboxRef = React.useRef<HTMLDivElement>(null)
  const lightboxOpen = Boolean(lightbox)
  const reduceMotion = useReducedMotion()

  const validYoutubeUrl = normalizeProjectUrl(project.youtubeUrl, { youtubeOnly: true })
  const activeYtId = validYoutubeUrl ? youtubeId(validYoutubeUrl) : null
  const repositoryUrl = normalizeProjectUrl(project.repo, { allowRelative: true })
  const demoUrl = normalizeProjectUrl(project.link, { allowRelative: true })
  const statusLabel: Record<string, string> = {
    completed: "Completed",
    "in-development": "In Development",
    prototype: "Prototype",
    research: "Research",
  }

  // Reading progress and active TOC section scroll tracking
  React.useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight
      if (totalScroll > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (window.scrollY / totalScroll) * 100)))
      }

      const sections = ["overview", "features", "gallery", "demo", "results"]
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i])
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 200) {
            setActiveSection(sections[i])
            break
          }
        }
      }
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  React.useEffect(() => {
    if (!lightboxOpen) return
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    lightboxRef.current?.querySelector<HTMLButtonElement>("button")?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [lightboxOpen])

  // Keyboard navigation for lightbox
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null)
      if (lightbox) {
        if (e.key === "Tab") {
          const buttons = lightboxRef.current?.querySelectorAll<HTMLButtonElement>("button")
          const first = buttons?.[0]
          const last = buttons?.[buttons.length - 1]
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault()
            last?.focus()
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault()
            first?.focus()
          }
        }
        if (e.key === "ArrowLeft" && lightbox.index > 0) {
          setLightbox({ ...lightbox, index: lightbox.index - 1 })
        }
        if (e.key === "ArrowRight" && lightbox.index < lightbox.list.length - 1) {
          setLightbox({ ...lightbox, index: lightbox.index + 1 })
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [lightbox])

  const copyLink = async () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      } catch {
        setCopied(false)
      }
    }
  }

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100
      window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" })
      setActiveSection(id)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })
  }

  const responsibilitiesList = React.useMemo(() => {
    if (project.responsibilities && project.responsibilities.length > 0) {
      return project.responsibilities.map((r) => ({
        icon: resolveIcon(r.icon),
        title: r.title,
        subtitle: r.subtitle,
      }))
    }
    if (project.features && project.features.length > 0) {
      return project.features.map((feat, i) => ({
        icon: [Cpu, Code, Zap, Wifi, ShieldCheck, Wrench][i % 6],
        title: feat,
        subtitle: "",
      }))
    }
    return []
  }, [project])

  const resultsList = React.useMemo(() => {
    if (project.results && project.results.length > 0) return project.results
    return []
  }, [project])

  // Combine hero image and gallery for complete preview list
  const galleryImages = React.useMemo(
    () => (project.images ?? []).filter((image) => isSupportedProjectImage(image) && !image.toLowerCase().endsWith(".svg")),
    [project.images],
  )
  const allImages = React.useMemo(() => {
    const list: string[] = []
    if (isSupportedProjectImage(project.image) && !project.image.toLowerCase().endsWith(".svg")) list.push(project.image)
    galleryImages.forEach((image) => { if (!list.includes(image)) list.push(image) })
    return list
  }, [project.image, galleryImages])

  return (
    <div className="portfolio-detail project-detail min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 inset-x-0 h-1 z-[100] bg-transparent">
        <div
          className="detail-progress h-full transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Sticky Header Navigation */}
      <header className="detail-topbar sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl transition-colors">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          {/* Back button & Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/#projects"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-muted/60 shrink-0"
            >
              <ArrowLeft className="size-4" />
              <span>All projects</span>
            </Link>
            <div className="h-4 w-px bg-border/60 shrink-0 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground truncate">
              <span>Dự án</span>
              <span>/</span>
              <span className="text-foreground font-medium truncate">{project.title}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {repositoryUrl && (
              <a
                href={repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border/60 hover:border-primary/50 hover:text-primary transition-all bg-card/60"
              >
                <Github className="size-3.5" />
                <span>Mã nguồn</span>
              </a>
            )}

            {demoUrl && (
              <a
                href={demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
              >
                <ExternalLink className="size-3.5" />
                <span className="sm:hidden">Demo</span>
                <span className="hidden sm:inline">Trải nghiệm Demo</span>
              </a>
            )}

            <button
              onClick={copyLink}
              title="Sao chép liên kết dự án"
              aria-label={copied ? "Đã sao chép liên kết" : "Sao chép liên kết dự án"}
              className="inline-flex items-center justify-center size-8 rounded-lg border border-border/60 hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? <Check className="size-4 text-primary" /> : <Share2 className="size-4" />}
            </button>

          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="project-main container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 sm:space-y-16">
        {/* HERO SECTION */}
        <section className="project-hero space-y-6">
          <p className="detail-eyebrow">ENGINEERING LAB / PROJECT CASE STUDY</p>
          {/* Status & Category */}
          <div className="flex flex-wrap items-center gap-2.5">
            {project.category && (
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="size-3" />
                {project.category}
              </span>
            )}
            {project.year && (
              <span className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full bg-muted/60 text-muted-foreground border border-border/40">
                <Calendar className="size-3" />
                {project.year}
              </span>
            )}
            {project.status && statusLabel[project.status] && (
              <span className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full bg-muted/60 text-muted-foreground border border-border/40">
                {statusLabel[project.status]}
              </span>
            )}
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-4">
            <h1 className="project-title font-semibold tracking-tight text-foreground">
              {project.title}
            </h1>
            {project.subtitle && (
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-4xl font-normal">
                {project.subtitle}
              </p>
            )}
          </div>

          {/* Meta Specs Grid */}
          {(project.role || project.projectType || project.highlight) && (
            <div className="project-meta grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {project.role && <div className="p-3.5 rounded-xl bg-card border border-border/60 space-y-1"><div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5"><Cpu className="size-3.5 text-primary" /> Vai trò</div><div className="text-xs sm:text-sm font-semibold text-foreground">{project.role}</div></div>}
              {project.projectType && <div className="p-3.5 rounded-xl bg-card border border-border/60 space-y-1"><div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5"><Tag className="size-3.5 text-primary" /> Loại dự án</div><div className="text-xs sm:text-sm font-semibold text-foreground">{project.projectType}</div></div>}
              {project.highlight && <div className="p-3.5 rounded-xl bg-card border border-border/60 space-y-1"><div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5"><Sparkles className="size-3.5 text-primary" /> Trọng tâm kỹ thuật</div><div className="text-xs sm:text-sm font-semibold text-foreground">{project.highlight}</div></div>}
            </div>
          )}

          {/* Main Hero Showcase Media */}
          {isSupportedProjectImage(project.image) && !project.image.toLowerCase().endsWith(".svg") ? (
            <div className="project-showcase relative w-full aspect-[16/9] sm:aspect-[21/9] overflow-hidden bg-muted/20 group">
              <ProjectMediaImage
                key={project.image}
                src={project.image}
                alt={project.title}
                fallbackLabel={project.title}
                sizes="(max-width: 1280px) 100vw, 1280px"
                priority
                className="object-contain transition-transform duration-500 group-hover:scale-[1.01]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-mono text-white/90">
                <span className="px-3 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10">
                  {project.category} · System Overview
                </span>
                <button
                  onClick={() => setLightbox({ list: allImages, index: 0 })}
                  aria-label={`Phóng to ảnh ${project.title}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/20 hover:bg-white hover:text-black transition-all"
                >
                  <Maximize2 className="size-3" />
                  <span>Phóng to</span>
                </button>
              </div>
            </div>
          ) : null}
        </section>

        {/* 2-COLUMN CASE STUDY LAYOUT */}
        <div className="project-body grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT COLUMN: Main Case Study Article (8 cols) */}
          <div className="project-article lg:col-span-8 space-y-12 sm:space-y-16">
            {/* SECTION 01: OVERVIEW */}
            <section id="overview" className="scroll-mt-24 space-y-5">
              <div className="flex items-center gap-2.5 border-b border-border/60 pb-3.5">
                <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase">
                  01 · Overview
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  Tổng quan & Bài toán kỹ thuật
                </h2>
              </div>

              {/* Rich Text Description */}
              <div
                className="text-base text-foreground/90 leading-relaxed ql-editor-display prose prose-slate dark:prose-invert max-w-none space-y-4"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(project.description || "") }}
              />

              {/* Quote / Highlight Box */}
              {project.overviewQuote ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-primary/5 border border-primary/20 flex gap-4 items-start shadow-sm">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                    <Zap className="size-5" />
                  </div>
                  <div className="space-y-1 text-sm">
                    <h4 className="font-bold text-foreground">Điểm nổi bật cốt lõi</h4>
                    <p className="text-muted-foreground leading-relaxed italic">
                      "{project.overviewQuote}"
                    </p>
                  </div>
                </div>
              ) : null}
            </section>

            {/* SECTION 02: FEATURES & RESPONSIBILITIES */}
            {responsibilitiesList.length > 0 && (
              <section id="features" className="scroll-mt-24 space-y-5">
                <div className="flex items-center gap-2.5 border-b border-border/60 pb-3.5">
                  <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase">
                    02 · Features
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    Chi tiết & Tính năng giải pháp
                  </h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {responsibilitiesList.map((item, idx) => {
                    const IconComp = item.icon
                    return (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl bg-card border border-border/60 hover:border-primary/40 transition-all space-y-2.5 shadow-sm group"
                      >
                        <div className="flex items-center gap-3 text-primary">
                          <div className="p-2.5 rounded-xl bg-primary/10 group-hover:scale-110 transition-transform">
                            <IconComp className="size-4" />
                          </div>
                          <h4 className="font-bold text-sm sm:text-base text-foreground leading-snug">
                            {item.title}
                          </h4>
                        </div>
                        {item.subtitle && (
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-0.5">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* SECTION 03: VISUALS & GALLERY */}
            {galleryImages.length > 0 && (
              <section id="gallery" className="scroll-mt-24 space-y-5">
                <div className="flex items-center gap-2.5 border-b border-border/60 pb-3.5">
                  <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase">
                    03 · Visuals
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    {project.visualsTitle || "Sơ đồ kiến trúc & Hình ảnh thực tế"}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {galleryImages.map((img, imgIdx) => (
                    <button
                      key={imgIdx}
                      onClick={() => setLightbox({ list: galleryImages, index: imgIdx })}
                      aria-label={`Xem ảnh ${imgIdx + 1} của ${project.title}`}
                      className="group/img relative aspect-[16/10] rounded-2xl overflow-hidden border border-border/60 bg-muted/20 hover:border-primary/50 transition-all shadow-md text-left"
                    >
                      <ProjectMediaImage
                        key={img}
                        src={img}
                        alt={`${project.title} - Hình ảnh ${imgIdx + 1}`}
                        fallbackLabel={project.title}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
                        className="object-contain transition-transform duration-500 group-hover/img:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition-colors" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-white/90">
                        <span className="px-2.5 py-1 rounded bg-black/70 backdrop-blur-md border border-white/10">
                          Ảnh {imgIdx + 1} / {galleryImages.length}
                        </span>
                        <span className="opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center gap-1 bg-primary text-primary-foreground px-2 py-0.5 rounded font-sans font-medium text-[10px]">
                          <Maximize2 className="size-3" /> Xem ảnh lớn
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* SECTION 04: DEMO VIDEO */}
            {project.showVideoDemo !== false && activeYtId && (
              <section id="demo" className="scroll-mt-24 space-y-5">
                <div className="flex items-center gap-2.5 border-b border-border/60 pb-3.5">
                  <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase">
                    04 · Demo
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    {project.videoTitle || "Video & Thử nghiệm thực tế"}
                  </h2>
                </div>

                <div className="relative aspect-video rounded-2xl overflow-hidden border border-border/80 bg-black shadow-2xl">
                  <iframe
                    src={`https://www.youtube.com/embed/${activeYtId}?rel=0`}
                    title="Video Demo dự án"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              </section>
            )}

            {/* SECTION 05: RESULTS & METRICS */}
            {resultsList.length > 0 && (
              <section id="results" className="scroll-mt-24 space-y-5">
                <div className="flex items-center gap-2.5 border-b border-border/60 pb-3.5">
                  <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase">
                    05 · Results
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    Kết quả & Chỉ số hiệu năng
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {resultsList.map((res, rIdx) => (
                    <div
                      key={rIdx}
                      className="p-5 rounded-2xl bg-card border border-border/60 space-y-2 shadow-sm flex flex-col justify-between"
                    >
                      <div className="text-2xl sm:text-3xl font-extrabold text-primary font-mono tracking-tight">
                        {res.number}
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-foreground">
                        {res.label}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT COLUMN: Sticky Sidebar (4 cols) */}
          <aside className="project-sidebar lg:col-span-4 space-y-6" aria-label="Thông tin dự án">
            <div className="sticky top-24 space-y-6">
              {/* Table of Contents (TOC) */}
              <div className="p-5 rounded-2xl bg-card border border-border/60 space-y-3.5 shadow-sm">
                <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                  <BarChart3 className="size-4 text-primary" />
                  Mục lục Case Study
                </h3>
                <nav className="space-y-1 text-xs font-medium" aria-label="Mục lục dự án">
                  {[
                    { id: "overview", label: "01. Tổng quan & Bài toán" },
                    ...(responsibilitiesList.length > 0
                      ? [{ id: "features", label: "02. Tính năng kỹ thuật" }]
                      : []),
                    ...(galleryImages.length > 0
                      ? [{ id: "gallery", label: "03. Sơ đồ kiến trúc" }]
                      : []),
                    ...(project.showVideoDemo !== false && activeYtId ? [{ id: "demo", label: "04. Video Demo" }] : []),
                    ...(resultsList.length > 0
                      ? [{ id: "results", label: "05. Kết quả & Chỉ số" }]
                      : []),
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      aria-current={activeSection === item.id ? "location" : undefined}
                      className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between ${
                        activeSection === item.id
                          ? "bg-primary/10 text-primary font-bold border-l-2 border-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <span>{item.label}</span>
                      {activeSection === item.id && (
                        <span className="size-1.5 rounded-full bg-primary" />
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tech Stack Pills */}
              {project.tech && project.tech.length > 0 && (
                <div className="p-5 rounded-2xl bg-card border border-border/60 space-y-3 shadow-sm">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                    <Code className="size-4 text-primary" />
                    Công nghệ sử dụng
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {project.tech.map((item, ti) => (
                      <span
                        key={ti}
                        className="px-2.5 py-1 text-xs font-mono rounded-lg bg-primary/10 text-primary border border-primary/20"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Project Quick Info Box */}
              <div className="p-5 rounded-2xl bg-muted/30 border border-border/60 space-y-3 text-xs">
                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <FolderOpen className="size-4 text-primary" />
                  Thông tin dự án
                </h3>
                <div className="space-y-2.5 text-muted-foreground">
                  {project.category && <div className="flex justify-between border-b border-border/40 pb-2"><span>Danh mục</span><span className="font-semibold text-foreground">{project.category}</span></div>}
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span>Thời gian</span>
                    <span className="font-semibold text-foreground">{project.year || "—"}</span>
                  </div>
                </div>

                {/* External Action Links */}
                <div className="pt-2 flex flex-col gap-2">
                  {repositoryUrl && (
                    <a
                      href={repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-border/60 hover:border-primary hover:text-primary transition-all text-xs font-semibold bg-card"
                    >
                      <Github className="size-4" />
                      <span>Xem mã nguồn trên GitHub</span>
                    </a>
                  )}
                  {demoUrl && (
                    <a
                      href={demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-xs font-semibold shadow-sm"
                    >
                      <ExternalLink className="size-4" />
                      <span>Truy cập hệ thống Demo</span>
                    </a>
                  )}
                </div>
              </div>

            </div>
          </aside>
        </div>

        {/* RELATED PROJECTS SECTION */}
        {relatedProjects.length > 0 && (
          <section className="project-related pt-8 sm:pt-12 border-t border-border/60 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-primary font-bold tracking-widest uppercase">
                  Explore More
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                  Các dự án tiêu biểu khác
                </h3>
              </div>
              <Link
                href="/#projects"
                className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                <span>Xem tất cả</span>
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {relatedProjects.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/projects/${rp.id}`}
                  className="group block rounded-2xl overflow-hidden border border-border/60 bg-card hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/5 p-4 space-y-3"
                >
                  {isSupportedProjectImage(rp.image) && !rp.image.toLowerCase().endsWith(".svg") && (
                    <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-muted/20 border border-border/40">
                      <ProjectMediaImage
                        key={rp.image}
                        src={rp.image}
                        alt={rp.title}
                        fallbackLabel={rp.title}
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-mono text-primary font-semibold uppercase">
                      {rp.category}
                    </div>
                    <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {rp.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {rp.description?.replace(/<[^>]*>?/gm, "").trim()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                    <span className="font-medium">Xem chi tiết</span>
                    <ArrowUpRight className="size-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Page Footer */}
      <footer className="detail-footer border-t border-border/40 py-8 text-xs text-muted-foreground">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono">
            © {new Date().getFullYear()} Engineering Lab
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <ChevronUp className="size-3.5" />
              <span>Lên đầu trang</span>
            </button>
            <Link href="/#projects" className="hover:text-foreground transition-colors">
              Danh mục dự án
            </Link>
            <Link href="/" className="hover:text-foreground transition-colors">
              Trang chủ
            </Link>
          </div>
        </div>
      </footer>

      {/* Full-Screen Image Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            ref={lightboxRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Hình ảnh dự án ${project.title}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md grid place-items-center p-4 sm:p-8"
          >
            <motion.div
              initial={{ scale: reduceMotion ? 1 : 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: reduceMotion ? 1 : 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-6xl max-h-full w-full h-full flex flex-col items-center justify-center"
            >
              <button
                onClick={() => setLightbox(null)}
                aria-label="Đóng ảnh phóng to"
                className="absolute top-2 right-2 z-20 grid place-items-center size-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
              >
                <X className="size-5" />
              </button>

              <div className="relative w-full h-full p-4 flex items-center justify-center group/lb">
                <ProjectMediaImage
                  key={lightbox.list[lightbox.index]}
                  src={lightbox.list[lightbox.index]}
                  alt={`${project.title} gallery preview`}
                  fallbackLabel={project.title}
                  sizes="100vw"
                  className="object-contain rounded-xl shadow-2xl"
                />

                {lightbox.index > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setLightbox({ ...lightbox, index: lightbox.index - 1 })
                    }}
                    aria-label="Ảnh trước"
                    className="absolute left-2 sm:left-4 z-20 grid place-items-center size-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
                  >
                    <ChevronLeft className="size-6" />
                  </button>
                )}

                {lightbox.index < lightbox.list.length - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setLightbox({ ...lightbox, index: lightbox.index + 1 })
                    }}
                    aria-label="Ảnh tiếp theo"
                    className="absolute right-2 sm:right-4 z-20 grid place-items-center size-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
                  >
                    <ChevronRight className="size-6" />
                  </button>
                )}

                <div className="absolute bottom-4 inset-x-0 text-center text-xs font-mono text-white/70">
                  {lightbox.index + 1} / {lightbox.list.length}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
