'use client'

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Building2,
  MapPin,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useSiteData } from "@/components/cv/site-data-context"
import { useLocale } from "@/components/cv/locale-context"
import { sanitizeHtml } from "@/lib/validation"
import Image from "next/image"

/** Extract a 4-digit year from the *start* of a period string like "2024 — Nay" */
function extractYear(period: string): string {
  const m = period.match(/\d{4}/)
  return m ? m[0] : ""
}

/** Determine whether this experience is still ongoing */
function isActive(period: string): boolean {
  const lower = period.toLowerCase()
  return (
    lower.includes("nay") ||
    lower.includes("present") ||
    lower.includes("current") ||
    lower.includes("hiện tại")
  )
}

/** Derive a role-type badge label from period / role */
function deriveType(period: string, role: string): string {
  const r = role.toLowerCase()
  if (r.includes("intern") || r.includes("thực tập")) return "INTERNSHIP"
  if (r.includes("freelance")) return "FREELANCE"
  if (r.includes("part-time") || r.includes("part time")) return "PART-TIME"
  return "FULL-TIME"
}

export function Experience() {
  const { experiences, profile } = useSiteData()
  const { t } = useLocale()

  // Selected experience index
  const [selected, setSelected] = React.useState(0)

  // Image lightbox
  const [lightbox, setLightbox] = React.useState<{
    list: string[]
    index: number
  } | null>(null)

  // Keyboard for lightbox
  React.useEffect(() => {
    if (!lightbox) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null)
      if (e.key === "ArrowLeft" && lightbox.index > 0)
        setLightbox({ ...lightbox, index: lightbox.index - 1 })
      if (e.key === "ArrowRight" && lightbox.index < lightbox.list.length - 1)
        setLightbox({ ...lightbox, index: lightbox.index + 1 })
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [lightbox])

  const exp = experiences[selected] ?? experiences[0]
  if (!exp) return null

  const active = isActive(exp.period)
  const roleType = deriveType(exp.period, exp.role)

  return (
    <section
      id="experience"
      className="relative py-8 sm:py-12 scroll-mt-16 md:scroll-mt-20"
    >
      <div className="container mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12">
        {/* ========================= HEADER ========================== */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-mono text-xs text-primary">
              <span className="h-px w-8 bg-primary/60" />
              <span>04 / EXPERIENCE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {t("Kinh nghiệm làm việc", "Work Experience")}
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl">
              {profile.experienceSubtitle ||
                t(
                  "Hành trình phát triển trong Embedded Linux, Firmware, IoT và Edge AI.",
                  "My journey in Embedded Linux, Firmware, IoT, and Edge AI."
                )}
            </p>
          </div>

          {/* Availability badge */}
          <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground bg-muted/50 border border-border rounded-full px-4 py-2 self-start sm:self-auto shrink-0 uppercase tracking-wider">
            <span className="career-status-dot" />
            <span>
              {t("AVAILABLE FOR OPPORTUNITIES", "AVAILABLE FOR OPPORTUNITIES")}
            </span>
          </div>
        </motion.div>

        {/* ========================= CONSOLE CONTAINER ========================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="career-console"
        >
          <div className="flex flex-col lg:flex-row min-h-[480px]">
            {/* ========== LEFT SIDEBAR — CAREER TIMELINE ========== */}
            <div className="career-sidebar w-full lg:w-[240px] xl:w-[260px] shrink-0 flex flex-col">
              {/* Sidebar header */}
              <div className="px-4 py-3 border-b border-border">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {t("CAREER TIMELINE", "CAREER TIMELINE")}
                </span>
              </div>

              {/* Timeline entries */}
              <div className="flex-1 overflow-y-auto">
                <div className="relative py-2">
                  {/* Vertical line */}
                  <div
                    className="career-sidebar-line absolute left-[28px] top-0 bottom-0 w-px"
                    aria-hidden
                  />

                  {experiences.map((e, i) => {
                    const year = extractYear(e.period)
                    const isCurrent = i === selected
                    const isOngoing = isActive(e.period)
                    return (
                      <button
                        key={e.id || i}
                        onClick={() => setSelected(i)}
                        className={
                          "career-entry w-full text-left pl-5 " +
                          (isCurrent ? "active" : "")
                        }
                      >
                        <div className="flex items-start gap-3">
                          {/* Node */}
                          <div className="relative z-10 mt-0.5">
                            <span
                              className={
                                "block h-[14px] w-[14px] rounded-full border-2 " +
                                (isCurrent
                                  ? "bg-primary border-primary career-pulse"
                                  : isOngoing
                                    ? "bg-primary/40 border-primary/40"
                                    : "bg-muted-foreground/20 border-muted-foreground/30")
                              }
                            />
                          </div>

                          {/* Text */}
                          <div className="min-w-0">
                            <span
                              className={
                                "block font-mono text-sm font-bold " +
                                (isCurrent
                                  ? "text-primary"
                                  : "text-foreground/70")
                              }
                            >
                              {year}
                            </span>
                            <span className="block text-[11px] text-muted-foreground truncate">
                              {e.company}
                            </span>
                            <span
                              className={
                                "block text-[10px] font-mono mt-0.5 " +
                                (isCurrent
                                  ? "text-primary"
                                  : "text-muted-foreground/60")
                              }
                            >
                              {t("xem chi tiết", "details")} →
                            </span>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Sidebar footer */}
              <div className="px-4 py-3 border-t border-border">
                <span className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                  {t("SELECT A MILESTONE", "SELECT A MILESTONE")}
                </span>
              </div>
            </div>

            {/* ========== RIGHT PANEL — DETAIL VIEW ========== */}
            <div className="career-detail flex-1 flex flex-col min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selected}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25 }}
                  className="flex-1 p-5 sm:p-6 lg:p-8 flex flex-col"
                >
                  {/* Top row: period + type badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
                      {exp.period}
                    </span>
                    <Badge
                      variant="outline"
                      className="font-mono text-[10px] uppercase tracking-wider text-primary border-primary/30"
                    >
                      {roleType}
                    </Badge>
                  </div>

                  {/* Role title */}
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight">
                    {exp.role}
                  </h3>

                  {/* Company + Location */}
                  <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1.5 text-sm">
                    {exp.companyUrl ? (
                      <a
                        href={exp.companyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-primary font-medium hover:underline"
                      >
                        <Building2 className="h-3.5 w-3.5" />
                        {exp.company}
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </a>
                    ) : (
                      <span className="flex items-center gap-1.5 text-primary font-medium">
                        <Building2 className="h-3.5 w-3.5" />
                        {exp.company}
                      </span>
                    )}

                    {exp.location && (
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {exp.location}
                      </span>
                    )}
                  </div>

                  {/* Overview / Description */}
                  {exp.description && (
                    <div className="mt-6">
                      <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-2">
                        OVERVIEW
                      </span>
                      <div
                        className="text-sm text-muted-foreground leading-relaxed ql-editor-display prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: sanitizeHtml(exp.description),
                        }}
                      />
                    </div>
                  )}

                  {/* Key Contributions (from highlights) */}
                  {exp.highlights && exp.highlights.length > 0 && (
                    <div className="mt-6">
                      <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-3">
                        {t("KEY CONTRIBUTIONS", "KEY CONTRIBUTIONS")}
                      </span>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {exp.highlights.map((h, hi) => (
                          <div key={hi} className="career-contrib-card">
                            <span className="block font-mono text-[10px] text-primary/60 mb-1">
                              {String(hi + 1).padStart(2, "0")}
                            </span>
                            <h4 className="text-sm font-semibold leading-tight mb-1">
                              {h.split("—")[0]?.trim() ||
                                h.split(":")[0]?.trim() ||
                                h}
                            </h4>
                            {(h.includes("—") || h.includes(":")) && (
                              <p className="text-[11px] text-muted-foreground leading-relaxed">
                                {h.split(/[—:]/)[1]?.trim()}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Technologies */}
                  {exp.stack && exp.stack.length > 0 && (
                    <div className="mt-6">
                      <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-2">
                        TECHNOLOGIES
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {exp.stack.map((tech) => (
                          <Badge
                            key={tech}
                            variant="outline"
                            className="font-mono text-[10px] py-1 px-2.5 bg-background/50"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gallery */}
                  {exp.images && exp.images.length > 0 && (
                    <div className="mt-6">
                      <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-2">
                        {t("GALLERY", "GALLERY")}
                      </span>
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
                        {exp.images.map((img, imgIdx) => (
                          <button
                            key={imgIdx}
                            onClick={() =>
                              setLightbox({
                                list: exp.images!,
                                index: imgIdx,
                              })
                            }
                            className="relative h-16 w-24 shrink-0 rounded-md overflow-hidden border border-border/50 hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 snap-center"
                          >
                            <Image
                              fill
                              src={img}
                              alt={`Gallery ${imgIdx}`}
                              className="object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Bottom status row */}
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                      <span className="career-status-dot" />
                      <span>{active ? "ACTIVE" : "COMPLETED"}</span>
                    </div>

                    {(exp.companyUrl || exp.images?.length) && (
                      <a
                        href={exp.companyUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 font-mono text-[11px] text-primary hover:underline"
                      >
                        {t("Xem chi tiết", "View details")}
                        <ArrowRight className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ========================= IMAGE LIGHTBOX ========================== */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm grid place-items-center p-4 sm:p-8"
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
                className="absolute top-0 right-0 z-20 grid place-items-center h-10 w-10 rounded-full bg-background/50 backdrop-blur border border-border hover:bg-muted transition-colors"
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
                      setLightbox({
                        ...lightbox,
                        index: lightbox.index - 1,
                      })
                    }}
                    className="absolute left-0 sm:left-4 z-20 grid place-items-center h-12 w-12 rounded-full bg-background/50 backdrop-blur border border-border hover:bg-muted transition-all opacity-0 group-hover/lb:opacity-100"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                )}

                {lightbox.index < lightbox.list.length - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setLightbox({
                        ...lightbox,
                        index: lightbox.index + 1,
                      })
                    }}
                    className="absolute right-0 sm:right-4 z-20 grid place-items-center h-12 w-12 rounded-full bg-background/50 backdrop-blur border border-border hover:bg-muted transition-all opacity-0 group-hover/lb:opacity-100"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                )}

                <div className="absolute bottom-0 inset-x-0 p-4 text-center text-sm font-mono text-muted-foreground opacity-0 group-hover/lb:opacity-100 transition-opacity">
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
