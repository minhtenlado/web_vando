'use client'

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Briefcase,
  MapPin,
  Calendar,
  ChevronRight,
  ExternalLink,
  X,
  ChevronLeft,
  ArrowRight,
  Building2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useSiteData } from "@/components/cv/site-data-context"
import { useLocale } from "@/components/cv/locale-context"
import { sanitizeHtml } from "@/lib/validation"
import Image from "next/image"

export function Experience() {
  const { experiences, profile } = useSiteData()
  const { t } = useLocale()
  const [lightbox, setLightbox] = React.useState<{
    list: string[]
    index: number
  } | null>(null)

  // Keyboard navigation for lightbox
  React.useEffect(() => {
    if (!lightbox) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null)
      if (e.key === "ArrowLeft" && lightbox.index > 0) {
        setLightbox({ ...lightbox, index: lightbox.index - 1 })
      }
      if (e.key === "ArrowRight" && lightbox.index < lightbox.list.length - 1) {
        setLightbox({ ...lightbox, index: lightbox.index + 1 })
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [lightbox])

  // Calculate stats for status bar
  const totalCompanies = new Set(experiences.map((e) => e.company)).size

  return (
    <section
      id="experience"
      className="career-pro relative py-8 sm:py-12 scroll-mt-16 md:scroll-mt-20"
    >
      <div className="container mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12">
        {/* ========================= HEADER ========================== */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12"
        >
          <div className="space-y-3">
            {/* Kicker */}
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

          {/* Status Badge */}
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-muted/50 border border-border rounded-full px-4 py-2 self-start sm:self-auto shrink-0">
            <span className="career-pro-status-dot" />
            <span>{t("SẴN SÀNG NHẬN VIỆC", "AVAILABLE FOR HIRE")}</span>
          </div>
        </motion.div>

        {/* ========================= TIMELINE ========================== */}
        <div className="relative">
          {/* Vertical timeline line */}
          <div
            className="career-pro-timeline-line absolute left-[11px] sm:left-[15px] top-0 bottom-0 w-px"
            aria-hidden
          />

          <ol className="space-y-8 sm:space-y-10">
            {experiences.map((exp, i) => {
              const isFirst = i === 0
              return (
                <motion.li
                  key={exp.id || exp.role + exp.company}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="relative pl-10 sm:pl-14"
                >
                  {/* Timeline Node */}
                  <span className="absolute left-0 sm:left-0 top-3 z-10 grid place-items-center">
                    <span
                      className={
                        "h-[22px] w-[22px] sm:h-[30px] sm:w-[30px] rounded-full border-[3px] sm:border-4 border-background grid place-items-center " +
                        (isFirst
                          ? "bg-primary career-pro-pulse"
                          : "bg-muted-foreground/30")
                      }
                    >
                      <span
                        className={
                          "h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full " +
                          (isFirst ? "bg-white" : "bg-muted-foreground/60")
                        }
                      />
                    </span>
                  </span>

                  {/* Period badge */}
                  <div className="mb-3">
                    <Badge
                      variant="secondary"
                      className="gap-1.5 font-mono text-[11px] px-3 py-1"
                    >
                      <Calendar className="h-3 w-3" />
                      {exp.period}
                    </Badge>
                  </div>

                  {/* Main Card */}
                  <div className="career-pro-card rounded-xl p-5 sm:p-6 group">
                    {/* Role + Company */}
                    <h3 className="text-lg sm:text-xl font-bold leading-tight tracking-tight">
                      {exp.role}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                      {exp.companyUrl ? (
                        <a
                          href={exp.companyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-primary font-medium hover:underline transition-colors"
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

                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {exp.location}
                      </span>
                    </div>

                    {/* Description */}
                    {exp.description && (
                      <div
                        className="mt-4 text-sm text-muted-foreground leading-relaxed ql-editor-display prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: sanitizeHtml(exp.description || ""),
                        }}
                      />
                    )}

                    {/* Highlights */}
                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="mt-4 space-y-2">
                        {exp.highlights.map((h) => (
                          <li
                            key={h}
                            className="flex items-start gap-2 text-sm leading-relaxed"
                          >
                            <ArrowRight className="career-pro-arrow h-4 w-4" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Tech stack */}
                    {exp.stack && exp.stack.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-border/50">
                        <div className="flex flex-wrap gap-1.5">
                          {exp.stack.map((tech) => (
                            <Badge
                              key={tech}
                              variant="outline"
                              className="font-mono text-[10px] py-0.5 bg-background/50"
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Gallery */}
                    {exp.images && exp.images.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-border/50">
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono mb-2">
                          {t("Ảnh / Gallery", "Gallery")}
                        </p>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
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
                  </div>
                </motion.li>
              )
            })}
          </ol>
        </div>

        {/* ========================= STATUS BAR ========================== */}
        {experiences.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="career-pro-statusbar mt-10 rounded-lg px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-muted-foreground"
          >
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-primary" />
                {experiences.length}{" "}
                {t("vị trí", "positions")}
              </span>
              <span>
                {totalCompanies} {t("công ty", "companies")}
              </span>
            </div>
            <span className="flex items-center gap-1.5">
              <span className="career-pro-status-dot" />
              STATUS: {t("SẴN SÀNG", "AVAILABLE")}
            </span>
          </motion.div>
        )}
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
