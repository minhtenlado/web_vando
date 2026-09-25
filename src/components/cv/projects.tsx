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
  Wifi,
  Play,
  Code,
  Terminal,
  ArrowUpRight,
  BarChart3,
  Wrench,
  Info,
  Search,
  Calendar,
  User,
  Tag,
  FolderOpen,
} from "lucide-react"
import { SectionHeader } from "./section-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSiteData } from "@/components/cv/site-data-context"
import type { SiteProject } from "@/lib/cv/site-data-server"
import { useLocale } from "@/components/cv/locale-context"
import { sanitizeHtml } from "@/lib/validation"
import Image from "next/image"

/* ─── Helpers ─── */

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

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  cpu: Cpu, layers: Layers, zap: Zap, code: Code, wifi: Wifi,
  shieldcheck: ShieldCheck, wrench: Wrench, sparkles: Sparkles,
  terminal: Terminal, info: Info,
}

function resolveIcon(name?: string) {
  if (!name) return CheckCircle2
  return ICON_MAP[name.toLowerCase()] || CheckCircle2
}

/* ─── Theme Palettes (muted & harmonious) ─── */

const THEMES = [
  { accent: "text-sky-400",    accentBg: "bg-sky-400/8",  accentBorder: "border-sky-400/15",  accentBadge: "bg-sky-400/10 text-sky-400 border-sky-400/20",    progressBar: "bg-sky-400" },
  { accent: "text-emerald-400", accentBg: "bg-emerald-400/8", accentBorder: "border-emerald-400/15", accentBadge: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20", progressBar: "bg-emerald-400" },
  { accent: "text-violet-400", accentBg: "bg-violet-400/8", accentBorder: "border-violet-400/15", accentBadge: "bg-violet-400/10 text-violet-400 border-violet-400/20", progressBar: "bg-violet-400" },
  { accent: "text-amber-400",  accentBg: "bg-amber-400/8", accentBorder: "border-amber-400/15", accentBadge: "bg-amber-400/10 text-amber-400 border-amber-400/20",  progressBar: "bg-amber-400" },
  { accent: "text-rose-400",   accentBg: "bg-rose-400/8",  accentBorder: "border-rose-400/15",  accentBadge: "bg-rose-400/10 text-rose-400 border-rose-400/20",   progressBar: "bg-rose-400" },
]

function getTheme(title: string) {
  const hash = title.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  return THEMES[hash % THEMES.length]
}

/* ─── Placeholder for projects without images ─── */

function PlaceholderCard({ title, category }: { title: string; category: string }) {
  return (
    <div className="relative w-full h-full bg-muted/40 flex flex-col items-center justify-center p-6 overflow-hidden select-none">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0z' fill='none'/%3E%3Cpath d='M0 20L20 0' stroke='%23888' stroke-width='.3'/%3E%3C/svg%3E")`,
      }} />
      <div className="relative z-10 flex flex-col items-center text-center gap-2.5">
        <div className="size-10 rounded-lg bg-muted border border-border/60 flex items-center justify-center text-muted-foreground">
          <FolderOpen className="size-5" />
        </div>
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-foreground/70 line-clamp-1 max-w-[200px]">{title}</p>
          <p className="text-[10px] text-muted-foreground">{category || "Project"}</p>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export function Projects() {
  const { projects, profile } = useSiteData()
  const { t } = useLocale()

  // ─── Filter State ───
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState("Tất cả")

  const categories = React.useMemo(() => {
    const cats = new Set<string>()
    projects.forEach(p => { if (p.category) cats.add(p.category) })
    return Array.from(cats)
  }, [projects])

  const filteredProjects = React.useMemo(() => {
    return projects.filter(p => {
      if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
      if (activeCategory !== "Tất cả" && activeCategory !== p.category) return false
      return true
    })
  }, [projects, searchQuery, activeCategory])

  // ─── Modal State ───
  const [activeProject, setActiveProject] = React.useState<SiteProject | null>(null)
  const [lightbox, setLightbox] = React.useState<{ list: string[]; index: number } | null>(null)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [scrollProgress, setScrollProgress] = React.useState(0)
  const [activeSection, setActiveSection] = React.useState("overview")
  const modalScrollRef = React.useRef<HTMLDivElement>(null)

  const theme = React.useMemo(() => getTheme(activeProject?.title || ""), [activeProject])
  const activeYtId = activeProject?.youtubeUrl ? youtubeId(activeProject.youtubeUrl) : null

  // ─── Scroll Tracking ───
  const handleModalScroll = React.useCallback(() => {
    if (!modalScrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = modalScrollRef.current
    const total = scrollHeight - clientHeight
    if (total > 0) setScrollProgress(Math.min(100, (scrollTop / total) * 100))

    const ids = ["overview", "features", "gallery", "demo", "results"]
    for (let i = ids.length - 1; i >= 0; i--) {
      const el = document.getElementById(ids[i])
      if (el && el.offsetTop <= scrollTop + 200) { setActiveSection(ids[i]); break }
    }
  }, [])

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
    setActiveSection(id)
  }

  const scrollToTop = () => modalScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })

  // ─── Keyboard ───
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lightbox) setLightbox(null)
        else if (activeProject) setActiveProject(null)
      }
      if (lightbox) {
        if (e.key === "ArrowLeft" && lightbox.index > 0) setLightbox({ ...lightbox, index: lightbox.index - 1 })
        if (e.key === "ArrowRight" && lightbox.index < lightbox.list.length - 1) setLightbox({ ...lightbox, index: lightbox.index + 1 })
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [lightbox, activeProject])

  // ─── Lock body scroll ───
  React.useEffect(() => {
    document.body.style.overflow = (lightbox || activeProject) ? "hidden" : "unset"
    return () => { document.body.style.overflow = "unset" }
  }, [lightbox, activeProject])

  // ─── Derived data for modal ───
  const responsibilitiesList = React.useMemo(() => {
    if (!activeProject) return []
    if (activeProject.responsibilities && activeProject.responsibilities.length > 0) {
      return activeProject.responsibilities.map(r => ({
        icon: resolveIcon(r.icon),
        title: r.title,
        subtitle: r.subtitle,
      }))
    }
    if (activeProject.features && activeProject.features.length > 0) {
      return activeProject.features.map((feat, i) => ({
        icon: [Cpu, Code, Zap, Wifi, ShieldCheck][i % 5],
        title: feat,
        subtitle: "",
      }))
    }
    return []
  }, [activeProject])

  const resultsList = React.useMemo(() => {
    if (!activeProject) return []
    if (activeProject.results && activeProject.results.length > 0) return activeProject.results
    return []
  }, [activeProject])

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */

  return (
    <section id="projects" className="py-8 sm:py-12 scroll-mt-16 md:scroll-mt-20">
      <div className="container mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12">
        <SectionHeader
          index="04 / projects"
          title={t("Dự án tiêu biểu", "Featured Projects")}
          subtitle=""
        />

        {/* ─── Toolbar ─── */}
        <div className="mt-8 flex flex-col xl:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
            <Button
              variant="ghost"
              onClick={() => setActiveCategory("Tất cả")}
              className={`rounded-full h-8 px-4 text-xs font-medium ${activeCategory === "Tất cả" ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t("Tất cả", "All")}
            </Button>
            {categories.map(cat => (
              <Button
                key={cat}
                variant="ghost"
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full h-8 px-4 text-xs font-medium ${activeCategory === cat ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {cat}
              </Button>
            ))}
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t("Tìm dự án...", "Search projects...")}
              className="w-full pl-9 h-8 rounded-lg border-border/40 bg-transparent text-xs"
            />
          </div>
        </div>

        {/* ─── Project Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((p, i) => {
            const hasImage = p.image && typeof p.image === "string" && p.image.trim().length > 0 && !p.image.endsWith(".svg")
            const cardTheme = getTheme(p.title)

            return (
              <motion.div
                key={p.id ?? p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: (i % 3) * 0.06 }}
              >
                <Card
                  className="group h-full overflow-hidden border border-border/50 bg-card hover:border-border transition-all duration-300 cursor-pointer flex flex-col"
                  onClick={() => setActiveProject(p)}
                >
                  {/* Image */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-muted/30 border-b border-border/30">
                    {hasImage ? (
                      <Image
                        fill
                        src={p.image}
                        alt={p.title}
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <PlaceholderCard title={p.title} category={p.category} />
                    )}
                    {/* Year badge */}
                    {p.year && (
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 text-white/80 backdrop-blur-sm border border-white/10">
                          {p.year}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <CardContent className="flex-1 p-4 sm:p-5 space-y-3">
                    {/* Category */}
                    {p.category && (
                      <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full border ${cardTheme.accentBadge}`}>
                        {p.category}
                      </span>
                    )}

                    <h3 className="text-base font-semibold leading-snug text-foreground line-clamp-2 group-hover:text-foreground/80 transition-colors">
                      {p.title}
                    </h3>

                    <div
                      className="text-sm text-muted-foreground leading-relaxed line-clamp-2 ql-editor-display prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(p.description || "") }}
                    />

                    {/* Tech */}
                    {p.tech && p.tech.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {p.tech.slice(0, 4).map((item, ti) => (
                          <span key={ti} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/30">
                            {item}
                          </span>
                        ))}
                        {p.tech.length > 4 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 text-muted-foreground">
                            +{p.tech.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Role */}
                    {p.role && (
                      <div className="flex items-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
                        <User className="size-3" />
                        <span>{p.role}</span>
                      </div>
                    )}
                  </CardContent>

                  {/* Footer */}
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/30">
                      <span className="font-medium">{t("Xem chi tiết", "View details")}</span>
                      <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Empty state */}
        {filteredProjects.length === 0 && (
          <div className="mt-10 text-center text-muted-foreground p-12 border border-dashed rounded-2xl border-border/40">
            {t("Không tìm thấy dự án nào phù hợp.", "No projects found.")}
          </div>
        )}

        {/* GitHub link */}
        <div className="mt-10 flex justify-center">
          <Button asChild variant="outline" size="lg" className="border-border/60 hover:border-border">
            <a
              href={profile?.github?.startsWith("http") ? profile.github : `https://${profile?.github || "github.com"}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-4 w-4 mr-2" />
              {t("Xem thêm trên GitHub", "View more on GitHub")}
            </a>
          </Button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
         PROJECT DETAIL MODAL
         ═══════════════════════════════════════════════════════════════ */}
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
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 md:p-6"
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className={`relative bg-background border border-border/60 shadow-2xl overflow-hidden flex flex-col ${
                isFullscreen
                  ? "w-full h-full rounded-none border-0"
                  : "w-full max-w-5xl h-[90vh] max-h-[880px] rounded-xl"
              }`}
            >
              {/* Progress bar */}
              <div className="absolute top-0 inset-x-0 h-0.5 bg-muted/20 z-30">
                <div
                  className={`h-full ${theme.progressBar} transition-all duration-150`}
                  style={{ width: `${scrollProgress}%` }}
                />
              </div>

              {/* Header */}
              <div className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3 bg-background/95 backdrop-blur-md border-b border-border/40">
                <div className="flex items-center gap-3 overflow-hidden min-w-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveProject(null)}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0"
                  >
                    <ArrowLeft className="size-3.5 mr-1" />
                    <span className="hidden sm:inline">{t("Quay lại", "Back")}</span>
                  </Button>
                  <span className="text-xs text-muted-foreground truncate">
                    {activeProject.title}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="grid place-items-center h-7 w-7 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  >
                    {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
                  </button>
                  <button
                    onClick={() => setActiveProject(null)}
                    className="grid place-items-center h-7 w-7 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div
                ref={modalScrollRef}
                onScroll={handleModalScroll}
                className="flex-1 overflow-y-auto scroll-smooth"
              >
                {/* Hero Image */}
                {activeProject.image && !activeProject.image.endsWith(".svg") && (
                  <div className="relative w-full aspect-[21/9] bg-muted/20">
                    <Image
                      fill
                      src={activeProject.image}
                      alt={activeProject.title}
                      className="object-contain"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                  {/* Title area */}
                  <div className="space-y-4 mb-8">
                    {activeProject.category && (
                      <span className={`inline-block text-[11px] font-medium px-2.5 py-1 rounded-full border ${theme.accentBadge}`}>
                        {activeProject.category}
                      </span>
                    )}
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                      {activeProject.title}
                    </h1>

                    {/* Meta row */}
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                      {activeProject.year && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="size-3" /> {activeProject.year}
                        </span>
                      )}
                      {activeProject.role && (
                        <span className="flex items-center gap-1.5">
                          <User className="size-3" /> {activeProject.role}
                        </span>
                      )}
                      {activeProject.highlight && (
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="size-3" /> {activeProject.highlight}
                        </span>
                      )}
                      {activeProject.projectType && (
                        <span className="flex items-center gap-1.5">
                          <Tag className="size-3" /> {activeProject.projectType}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 2-column layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main column */}
                    <div className="lg:col-span-8 space-y-10">

                      {/* Section: Overview */}
                      <section id="overview" className="scroll-mt-20 space-y-4">
                        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <span className={`text-[10px] font-mono ${theme.accent} font-bold`}>01</span>
                          {t("Tổng quan dự án", "Project Overview")}
                        </h2>
                        <div
                          className="text-sm text-foreground/85 leading-relaxed ql-editor-display prose prose-sm dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(activeProject.description || "") }}
                        />
                        {activeProject.overviewQuote && (
                          <blockquote className={`border-l-2 ${theme.accentBorder} pl-4 text-sm text-muted-foreground italic`}>
                            {activeProject.overviewQuote}
                          </blockquote>
                        )}
                      </section>

                      {/* Section: Features */}
                      {responsibilitiesList.length > 0 && (
                        <section id="features" className="scroll-mt-20 space-y-4">
                          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <span className={`text-[10px] font-mono ${theme.accent} font-bold`}>02</span>
                            {t("Chi tiết & Tính năng", "Features & Details")}
                          </h2>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {responsibilitiesList.map((item, idx) => {
                              const IconComp = item.icon
                              return (
                                <div key={idx} className="p-4 rounded-lg bg-muted/30 border border-border/30 space-y-2">
                                  <div className="flex items-center gap-2.5">
                                    <div className={`p-1.5 rounded-md ${theme.accentBg}`}>
                                      <IconComp className={`size-3.5 ${theme.accent}`} />
                                    </div>
                                    <h4 className="font-medium text-sm text-foreground">{item.title}</h4>
                                  </div>
                                  {item.subtitle && (
                                    <p className="text-xs text-muted-foreground leading-relaxed pl-0.5">
                                      {item.subtitle}
                                    </p>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </section>
                      )}

                      {/* Section: Gallery */}
                      {activeProject.images && activeProject.images.length > 0 && (
                        <section id="gallery" className="scroll-mt-20 space-y-4">
                          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <span className={`text-[10px] font-mono ${theme.accent} font-bold`}>03</span>
                            {activeProject.visualsTitle || t("Hình ảnh dự án", "Project Gallery")}
                          </h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {activeProject.images.map((img, imgIdx) => (
                              <button
                                key={imgIdx}
                                onClick={() => setLightbox({ list: activeProject.images!, index: imgIdx })}
                                className="group/img relative aspect-video rounded-lg overflow-hidden border border-border/30 bg-muted/20 hover:border-border/60 transition-all"
                              >
                                <Image
                                  fill
                                  src={img}
                                  alt={`${activeProject.title} - ${imgIdx + 1}`}
                                  className="object-contain transition-transform duration-300 group-hover/img:scale-[1.02]"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors" />
                                <span className="absolute bottom-1.5 left-1.5 text-[9px] font-mono text-white/70 bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-sm">
                                  {imgIdx + 1}/{activeProject.images!.length}
                                </span>
                              </button>
                            ))}
                          </div>
                        </section>
                      )}

                      {/* Section: Demo Video */}
                      {activeProject.showVideoDemo !== false && (activeProject.youtubeUrl || !activeYtId) && activeYtId && (
                        <section id="demo" className="scroll-mt-20 space-y-4">
                          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <span className={`text-[10px] font-mono ${theme.accent} font-bold`}>04</span>
                            {activeProject.videoTitle || t("Video Demo", "Video Demo")}
                          </h2>
                          <div className="relative aspect-video rounded-lg overflow-hidden border border-border/30 bg-black">
                            <iframe
                              src={`https://www.youtube.com/embed/${activeYtId}?rel=0`}
                              title="YouTube video"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="absolute inset-0 h-full w-full"
                            />
                          </div>
                        </section>
                      )}

                      {/* Section: Results */}
                      {resultsList.length > 0 && (
                        <section id="results" className="scroll-mt-20 space-y-4">
                          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <span className={`text-[10px] font-mono ${theme.accent} font-bold`}>05</span>
                            {t("Kết quả đạt được", "Results & Metrics")}
                          </h2>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {resultsList.map((res, rIdx) => (
                              <div key={rIdx} className="p-3.5 rounded-lg bg-muted/30 border border-border/30 space-y-1">
                                <div className={`text-lg font-bold font-mono ${theme.accent}`}>
                                  {res.value || res.number}
                                </div>
                                <div className="text-xs text-foreground font-medium">{res.label}</div>
                                {res.sub && <div className="text-[10px] text-muted-foreground">{res.sub}</div>}
                              </div>
                            ))}
                          </div>
                        </section>
                      )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-4">
                      <div className="sticky top-4 space-y-4">

                        {/* TOC */}
                        <div className="p-4 rounded-lg bg-muted/20 border border-border/30 space-y-2.5">
                          <h3 className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                            {t("Mục lục", "Contents")}
                          </h3>
                          <nav className="space-y-0.5 text-xs">
                            {[
                              { id: "overview", label: t("Tổng quan", "Overview") },
                              ...(responsibilitiesList.length > 0 ? [{ id: "features", label: t("Tính năng", "Features") }] : []),
                              ...(activeProject.images && activeProject.images.length > 0 ? [{ id: "gallery", label: t("Hình ảnh", "Gallery") }] : []),
                              ...(activeYtId ? [{ id: "demo", label: "Video Demo" }] : []),
                              ...(resultsList.length > 0 ? [{ id: "results", label: t("Kết quả", "Results") }] : []),
                            ].map(item => (
                              <button
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                className={`w-full text-left px-2.5 py-1.5 rounded-md transition-colors ${
                                  activeSection === item.id
                                    ? `${theme.accentBg} ${theme.accent} font-medium`
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                                }`}
                              >
                                {item.label}
                              </button>
                            ))}
                          </nav>
                        </div>

                        {/* Tech stack */}
                        {activeProject.tech && activeProject.tech.length > 0 && (
                          <div className="p-4 rounded-lg bg-muted/20 border border-border/30 space-y-2.5">
                            <h3 className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                              <Code className="size-3" />
                              {t("Công nghệ", "Tech Stack")}
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                              {activeProject.tech.map((item, ti) => (
                                <span key={ti} className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/30">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Project info */}
                        <div className="p-4 rounded-lg bg-muted/20 border border-border/30 space-y-2.5 text-xs">
                          <h3 className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                            {t("Thông tin", "Info")}
                          </h3>
                          <div className="space-y-2 text-muted-foreground">
                            <div className="flex justify-between">
                              <span>{t("Tác giả", "Author")}</span>
                              <span className="font-medium text-foreground">{profile.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>{t("Danh mục", "Category")}</span>
                              <span className="font-medium text-foreground">{activeProject.category}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>{t("Trạng thái", "Status")}</span>
                              <span className="font-medium text-emerald-500">{t("Hoàn thành", "Completed")}</span>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex flex-col gap-1.5 pt-2">
                            {activeProject.repo && (
                              <a
                                href={activeProject.repo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-1.5 h-8 rounded-md border border-border/40 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                              >
                                <Github className="size-3.5" />
                                GitHub
                              </a>
                            )}
                            {activeProject.link && (
                              <a
                                href={activeProject.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-1.5 h-8 rounded-md border border-border/40 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                              >
                                <ExternalLink className="size-3.5" />
                                Demo
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-t border-border/30 bg-muted/10 text-xs text-muted-foreground">
                <span className="font-mono">{profile.name}</span>
                <div className="flex items-center gap-2">
                  <button onClick={scrollToTop} className="hover:text-foreground transition-colors flex items-center gap-1">
                    <ChevronUp className="size-3" />
                    {t("Về đầu", "Top")}
                  </button>
                  <button onClick={() => setActiveProject(null)} className="hover:text-foreground transition-colors">
                    {t("Đóng", "Close")}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Lightbox ─── */}
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
              onClick={e => e.stopPropagation()}
              className="relative max-w-5xl max-h-full w-full h-full flex flex-col items-center justify-center"
            >
              <button
                onClick={() => setLightbox(null)}
                className="absolute top-0 right-0 z-20 grid place-items-center h-9 w-9 rounded-full bg-white/10 backdrop-blur border border-white/10 hover:bg-white/20 transition-colors text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="relative w-full h-full p-4 flex items-center justify-center group/lb">
                <Image
                  fill
                  key={lightbox.index}
                  src={lightbox.list[lightbox.index]}
                  alt="Gallery full size"
                  className="object-contain rounded-md"
                />

                {lightbox.index > 0 && (
                  <button
                    onClick={e => { e.stopPropagation(); setLightbox({ ...lightbox, index: lightbox.index - 1 }) }}
                    className="absolute left-2 z-20 grid place-items-center h-10 w-10 rounded-full bg-white/10 backdrop-blur border border-white/10 hover:bg-white/20 transition-all opacity-80 sm:opacity-0 sm:group-hover/lb:opacity-100 text-white"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}

                {lightbox.index < lightbox.list.length - 1 && (
                  <button
                    onClick={e => { e.stopPropagation(); setLightbox({ ...lightbox, index: lightbox.index + 1 }) }}
                    className="absolute right-2 z-20 grid place-items-center h-10 w-10 rounded-full bg-white/10 backdrop-blur border border-white/10 hover:bg-white/20 transition-all opacity-80 sm:opacity-0 sm:group-hover/lb:opacity-100 text-white"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                )}

                <div className="absolute bottom-2 inset-x-0 text-center text-sm font-mono text-white/60">
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
