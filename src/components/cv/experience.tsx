'use client'

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Briefcase, MapPin, Calendar, ChevronRight, ExternalLink, X, ChevronLeft } from "lucide-react"
import { SectionHeader } from "./section-header"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useSiteData } from "@/lib/cv/site-data-context"
import { useLocale } from "@/components/cv/locale-context"
import DOMPurify from "isomorphic-dompurify"

export function Experience() {
  const { experiences } = useSiteData()
  const { t } = useLocale()
  const [lightbox, setLightbox] = React.useState<{ list: string[], index: number } | null>(null)

  // Keyboard navigation for lightbox
  React.useEffect(() => {
    if (!lightbox) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowLeft' && lightbox.index > 0) {
        setLightbox({ ...lightbox, index: lightbox.index - 1 })
      }
      if (e.key === 'ArrowRight' && lightbox.index < lightbox.list.length - 1) {
        setLightbox({ ...lightbox, index: lightbox.index + 1 })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightbox])

  return (
    <section id="experience" className="relative py-20 sm:py-28">
      <div className="container mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12">
        <SectionHeader
          index="03 / experience"
          title={t("Kinh nghiệm làm việc", "Work Experience")}
          subtitle={t(
            "Hơn 6 năm xây dựng sản phẩm nhúng thương mại — từ nguyên mẫu nghiên cứu đến triển khai hàng chục nghìn thiết bị ngoài thực địa.",
            "Over 6 years of building commercial embedded products — from research prototypes to deploying tens of thousands of devices in the field."
          )}
        />

        <div className="mt-12 relative">
          {/* Vertical line */}
          <div
            className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/60 via-border to-transparent sm:-translate-x-1/2"
            aria-hidden
          />

          <ol className="space-y-10">
            {experiences.map((exp, i) => {
              const isLeft = i % 2 === 0
              return (
                <motion.li
                  key={exp.role + exp.company}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5 }}
                  className="relative pl-12 sm:pl-0"
                >
                  {/* Node */}
                  <span className="absolute left-4 sm:left-1/2 top-2 -translate-x-1/2 z-10 grid place-items-center">
                    <span className="h-3.5 w-3.5 rounded-full bg-primary border-4 border-background ring-1 ring-primary/30" />
                  </span>

                  <div
                    className={
                      "sm:w-1/2 sm:pr-10 " +
                      (isLeft
                        ? "sm:mr-auto sm:text-right"
                        : "sm:ml-auto sm:pl-10 sm:pr-0")
                    }
                  >
                    <Card className="p-5 border-border/60 bg-card/40 backdrop-blur hover:border-primary/40 transition-colors">
                      <div
                        className={
                          "flex flex-wrap items-center gap-2 mb-2 " +
                          (isLeft ? "sm:justify-end" : "")
                        }
                      >
                        <Badge variant="secondary" className="gap-1 font-mono">
                          <Calendar className="h-3 w-3" /> {exp.period}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold leading-tight">
                        {exp.role}
                      </h3>
                      <div
                        className={
                          "mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground " +
                          (isLeft ? "sm:justify-end" : "")
                        }
                      >
                        {exp.companyUrl ? (
                          <a
                            href={exp.companyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary font-medium hover:underline"
                          >
                            <Briefcase className="h-3.5 w-3.5" /> {exp.company}
                            <ExternalLink className="h-3 w-3 opacity-70" />
                          </a>
                        ) : (
                          <span className="flex items-center gap-1 text-primary font-medium">
                            <Briefcase className="h-3.5 w-3.5" /> {exp.company}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {exp.location}
                        </span>
                      </div>

                      <div 
                        className="mt-3 text-sm text-muted-foreground leading-relaxed ql-editor-display prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize((exp.description || "").replace(/&nbsp;/g, ' '), { ADD_TAGS: ["iframe"], ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "target", "class"] }) }}
                      />

                      <ul
                        className={
                          "mt-3 space-y-1.5 " +
                          (isLeft ? "sm:text-right" : "")
                        }
                      >
                        {exp.highlights.map((h) => (
                          <li
                            key={h}
                            className={
                              "flex gap-1.5 text-sm leading-relaxed " +
                              (isLeft
                                ? "sm:flex-row-reverse sm:text-right"
                                : "")
                            }
                          >
                            <ChevronRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>

                      <div
                        className={
                          "mt-4 flex flex-wrap gap-1.5 " +
                          (isLeft ? "sm:justify-end" : "")
                        }
                      >
                        {exp.stack.map((tech) => (
                          <Badge
                            key={tech}
                            variant="outline"
                            className="font-mono text-[10px] py-0.5"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                      
                      {exp.images && exp.images.length > 0 && (
                        <div className="mt-4">
                          <p className={"text-[11px] uppercase tracking-wider text-muted-foreground font-mono mb-2 " + (isLeft ? "sm:text-right" : "")}>
                            {t("Minh chứng / Gallery", "Evidence / Gallery")}
                          </p>
                          <div className={"flex gap-2 overflow-x-auto pb-2 scrollbar-none " + (isLeft ? "sm:justify-end" : "")}>
                            {exp.images.map((img, imgIdx) => (
                              <button
                                key={imgIdx}
                                onClick={() => setLightbox({ list: exp.images!, index: imgIdx })}
                                className="relative h-16 w-24 shrink-0 rounded-md overflow-hidden border border-border/50 hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                              >
                                <img src={img} alt={`Gallery ${imgIdx}`} className="absolute inset-0 h-full w-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  </div>
                </motion.li>
              )
            })}
          </ol>
        </div>
      </div>
      
      {/* Image lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
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
                <img
                  key={lightbox.index}
                  src={lightbox.list[lightbox.index]}
                  alt="Gallery full size"
                  className="max-w-full max-h-full object-contain rounded-md shadow-2xl border border-border/20 animate-in fade-in zoom-in-95 duration-200"
                />
                
                {lightbox.index > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setLightbox({ ...lightbox, index: lightbox.index - 1 }) }}
                    className="absolute left-0 sm:left-4 z-20 grid place-items-center h-12 w-12 rounded-full bg-background/50 backdrop-blur border border-border hover:bg-muted transition-all opacity-0 group-hover/lb:opacity-100"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                )}
                
                {lightbox.index < lightbox.list.length - 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setLightbox({ ...lightbox, index: lightbox.index + 1 }) }}
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
