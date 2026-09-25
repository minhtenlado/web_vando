'use client'

import * as React from "react"
import { motion } from "framer-motion"
import {
  Github,
  ArrowUpRight,
  Search,
  Calendar,
  User,
  Sparkles,
  Layers,
  FolderOpen,
  X,
} from "lucide-react"
import { SectionHeader } from "./section-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSiteData } from "@/components/cv/site-data-context"
import { useLocale } from "@/components/cv/locale-context"
import { sanitizeHtml } from "@/lib/validation"
import Image from "next/image"

/* ─── Harmonious Tech Badges Palettes ─── */
const THEMES = [
  { accentBadge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25", glow: "hover:shadow-emerald-500/10", borderHover: "hover:border-emerald-500/40" },
  { accentBadge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/25", glow: "hover:shadow-cyan-500/10", borderHover: "hover:border-cyan-500/40" },
  { accentBadge: "bg-sky-500/10 text-sky-400 border-sky-500/25", glow: "hover:shadow-sky-500/10", borderHover: "hover:border-sky-500/40" },
  { accentBadge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/25", glow: "hover:shadow-indigo-500/10", borderHover: "hover:border-indigo-500/40" },
  { accentBadge: "bg-amber-500/10 text-amber-400 border-amber-500/25", glow: "hover:shadow-amber-500/10", borderHover: "hover:border-amber-500/40" },
]

function getTheme(title: string) {
  const hash = title.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  return THEMES[hash % THEMES.length]
}

function PlaceholderCard({ title, category }: { title: string; category: string }) {
  return (
    <div className="relative w-full h-full min-h-[190px] bg-muted/30 flex flex-col items-center justify-center p-6 overflow-hidden select-none">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3Cpath d='M0 24L24 0' stroke='%23888' stroke-width='.4'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative z-10 flex flex-col items-center text-center gap-2">
        <div className="size-11 rounded-xl bg-card/80 border border-border/60 flex items-center justify-center text-muted-foreground shadow-sm">
          <FolderOpen className="size-5 text-primary" />
        </div>
        <p className="text-xs font-semibold text-foreground/80 line-clamp-1 max-w-[220px]">
          {title}
        </p>
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          {category || "Embedded Engineering"}
        </span>
      </div>
    </div>
  )
}

export function Projects() {
  const { projects, profile } = useSiteData()
  const { t } = useLocale()

  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState("Tất cả")

  const categories = React.useMemo(() => {
    const cats = new Set<string>()
    projects.forEach((p) => {
      if (p.category) cats.add(p.category)
    })
    return Array.from(cats)
  }, [projects])

  const filteredProjects = React.useMemo(() => {
    return projects.filter((p) => {
      if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
      if (activeCategory !== "Tất cả" && activeCategory !== p.category) return false
      return true
    })
  }, [projects, searchQuery, activeCategory])

  return (
    <section id="projects" className="py-8 sm:py-12 scroll-mt-16 md:scroll-mt-20">
      <div className="container mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12">
        <SectionHeader
          index="04 / projects"
          title={t("Dự án tiêu biểu", "Featured Projects")}
          subtitle=""
        />

        {/* ─── Filter & Search Toolbar ─── */}
        <div className="mt-8 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 mb-8">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveCategory("Tất cả")}
              className={`rounded-full h-8 px-4 text-xs font-medium transition-all ${
                activeCategory === "Tất cả"
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary/90"
                  : "bg-muted/40 hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border/40"
              }`}
            >
              {t("Tất cả", "All")} ({projects.length})
            </Button>
            {categories.map((cat) => {
              const count = projects.filter((p) => p.category === cat).length
              const isActive = activeCategory === cat
              return (
                <Button
                  key={cat}
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full h-8 px-4 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary/90"
                      : "bg-muted/40 hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border/40"
                  }`}
                >
                  <span>{cat}</span>
                  <span className="ml-1.5 opacity-60 text-[10px] font-mono">({count})</span>
                </Button>
              )
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("Tìm dự án theo tên...", "Search projects...")}
              className="w-full pl-9 pr-8 h-9 rounded-xl border-border/60 bg-card/60 text-xs focus-visible:ring-1 focus-visible:ring-primary/40 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ─── Project Grid (3 Columns) ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p, i) => {
            const hasImage =
              p.image &&
              typeof p.image === "string" &&
              p.image.trim().length > 0 &&
              !p.image.endsWith(".svg")
            const cardTheme = getTheme(p.title)

            return (
              <motion.div
                key={p.id ?? p.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
                className="h-full"
              >
                {/* Click to open in a NEW TAB */}
                <a
                  href={`/projects/${p.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl group"
                >
                  <Card
                    className={`h-full flex flex-col justify-between overflow-hidden border border-border/50 bg-gradient-to-b from-card via-card to-card/90 dark:from-[#0d1210] dark:via-[#0c100e] dark:to-[#0a0d0c] ${cardTheme.borderHover} transition-all duration-300 rounded-2xl shadow-lg shadow-black/5 dark:shadow-black/20 hover:shadow-2xl ${cardTheme.glow} hover:-translate-y-1 relative`}
                  >
                    <div>
                      {/* Image Header with 16:9 Aspect Ratio */}
                      <div className="relative aspect-[16/9] overflow-hidden bg-muted/20 border-b border-border/40">
                        {hasImage ? (
                          <Image
                            fill
                            src={p.image}
                            alt={p.title}
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                        ) : (
                          <PlaceholderCard title={p.title} category={p.category} />
                        )}

                        {/* Soft Vignette Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent pointer-events-none" />

                        {/* Top Badges */}
                        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 pointer-events-none">
                          {p.category && (
                            <span
                              className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border backdrop-blur-md shadow-md ${cardTheme.accentBadge} bg-black/60`}
                            >
                              {p.category}
                            </span>
                          )}
                          {p.year && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/60 text-white/90 backdrop-blur-md border border-white/10 flex items-center gap-1 shadow-md">
                              <Calendar className="size-2.5 opacity-70" />
                              {p.year}
                            </span>
                          )}
                        </div>

                        {/* Bottom Highlight Kicker */}
                        {p.highlight && (
                          <div className="absolute bottom-2.5 left-3 right-3 text-[11px] font-mono text-white/90 truncate flex items-center gap-1.5 pointer-events-none">
                            <Sparkles className="size-3 text-primary animate-pulse shrink-0" />
                            <span className="truncate">{p.highlight}</span>
                          </div>
                        )}
                      </div>

                      {/* Content Body */}
                      <CardContent className="p-5 sm:p-6 space-y-3.5">
                        {/* Title */}
                        <h3 className="text-base sm:text-lg font-bold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {p.title}
                        </h3>

                        {/* Excerpt Description */}
                        <div
                          className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3 ql-editor-display prose prose-sm dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(p.description || "") }}
                        />

                        {/* Tech Stack Pills */}
                        {p.tech && p.tech.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {p.tech.slice(0, 4).map((item, ti) => (
                              <span
                                key={ti}
                                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/40"
                              >
                                {item}
                              </span>
                            ))}
                            {p.tech.length > 4 && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-muted/40 text-muted-foreground">
                                +{p.tech.length - 4}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Role Row */}
                        {p.role && (
                          <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground font-mono">
                            <User className="size-3 text-primary shrink-0" />
                            <span className="truncate">{p.role}</span>
                          </div>
                        )}
                      </CardContent>
                    </div>

                    {/* Card Footer: Action button */}
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0">
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3.5 border-t border-border/40 group-hover:text-primary transition-colors">
                        <span className="font-semibold flex items-center gap-1.5">
                          <span>{t("Xem chi tiết Case Study", "View Case Study")}</span>
                        </span>
                        <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 shadow-sm">
                          <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </a>
              </motion.div>
            )
          })}
        </div>

        {/* Empty state */}
        {filteredProjects.length === 0 && (
          <div className="mt-10 text-center text-muted-foreground p-12 border border-dashed rounded-3xl border-border/60 space-y-3">
            <p className="text-sm font-medium">
              {t("Không tìm thấy dự án nào phù hợp với tìm kiếm của bạn.", "No projects found matching your search.")}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("")
                setActiveCategory("Tất cả")
              }}
            >
              {t("Xem tất cả dự án", "Reset filter")}
            </Button>
          </div>
        )}

        {/* GitHub link button */}
        <div className="mt-12 flex justify-center">
          <Button asChild variant="outline" size="lg" className="border-border/60 hover:border-primary shadow-sm">
            <a
              href={
                profile?.github?.startsWith("http")
                  ? profile.github
                  : `https://${profile?.github || "github.com/minhtenlado"}`
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-4 w-4 mr-2" />
              {t("Xem thêm trên GitHub", "View more on GitHub")}
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
