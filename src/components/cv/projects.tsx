'use client'

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Github, ExternalLink, CheckCircle2, FolderGit2, X, ChevronLeft, ChevronRight } from "lucide-react"
import { SectionHeader } from "./section-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useSiteData } from "@/components/cv/site-data-context"
import type { SiteProject } from "@/lib/cv/site-data-server"
import { useLocale } from "@/components/cv/locale-context"


/** Extract a YouTube video id from various URL forms. */
function youtubeId(url: string): string | null {
  if (!url) return null
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
  // bare 11-char id
  if (/^[\w-]{11}$/.test(url.trim())) return url.trim()
  return null
}

export function Projects() {
  const { projects, profile } = useSiteData()
  const { t } = useLocale()
  const [lightbox, setLightbox] = React.useState<{ list: string[], index: number } | null>(null)
  const [activeProject, setActiveProject] = React.useState<SiteProject | null>(null)

  // Keyboard navigation for lightbox & modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightbox) setLightbox(null)
        else if (activeProject) setActiveProject(null)
      }
      if (lightbox) {
        if (e.key === 'ArrowLeft' && lightbox.index > 0) {
          setLightbox({ ...lightbox, index: lightbox.index - 1 })
        }
        if (e.key === 'ArrowRight' && lightbox.index < lightbox.list.length - 1) {
          setLightbox({ ...lightbox, index: lightbox.index + 1 })
        }
      }
    }
    if (lightbox || activeProject) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [lightbox, activeProject])

  return (
    <section id="projects" className="relative py-20 sm:py-28 bg-muted/20">
      <div className="container mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12">
        <SectionHeader
          index="04 / projects"
          title={t("Dự án tiêu biểu", "Featured Projects")}
          subtitle={t(
            "Một vài dự án tôi tự hào nhất — từ sản phẩm thương mại đến dự án mã nguồn mở cộng đồng. Nhấn nút video để xem demo.",
            "A few projects I'm most proud of — from commercial products to community open-source projects. Click the video button for a demo."
          )}
        />

        <div className="mt-10 grid md:grid-cols-2 gap-6">
          {projects.map((p, i) => {
            const ytId = youtubeId(p.youtubeUrl ?? "")
            return (
              <motion.div
                key={p.id ?? p.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
              >
                <Card className="group h-full overflow-hidden border-border/60 bg-card/40 backdrop-blur hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                  {/* Image / video thumb */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={t(`Ảnh minh họa dự án ${p.title}`, `Project image for ${p.title}`)}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        <FolderGit2 className="h-12 w-12" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                    <div className="absolute bottom-3 right-3 flex gap-2">
                      <Badge variant="secondary" className="bg-background/80 backdrop-blur border-border/50">
                        {p.category}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-semibold leading-tight line-clamp-1">
                        {p.title}
                      </h3>
                    </div>
                    <div 
                      className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3 ql-editor-display prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: (p.description || "").replace(/&nbsp;/g, ' ') }}
                    />
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <Button 
                        className="w-full justify-between hover:bg-primary hover:text-primary-foreground transition-colors" 
                        variant="secondary" 
                        onClick={() => setActiveProject(p)}
                      >
                        {t("Xem chi tiết", "View Details")}
                        <ExternalLink className="size-4 ml-2 opacity-50" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <Button asChild variant="outline" size="lg">
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

      {/* Project Detail Modal */}
      <AnimatePresence>
        {activeProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveProject(null)}
            className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-md grid place-items-center p-4 sm:p-6 lg:p-12"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl h-full max-h-[90vh] bg-card border border-border shadow-2xl rounded-xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/50 bg-muted/20">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      <FolderGit2 className="size-3 mr-1" />
                      {activeProject.category}
                    </Badge>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold leading-tight">{activeProject.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveProject(null)}
                    className="grid place-items-center h-10 w-10 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
                <div className="max-w-3xl mx-auto space-y-8">
                    {/* Hero Image */}
                    {activeProject.image && (
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-border/50 shadow-sm">
                        <img src={activeProject.image} alt={activeProject.title} className="absolute inset-0 w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Description */}
                    <div>
                      <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                        Tổng quan
                      </h3>
                      <div 
                        className="text-base text-foreground/90 leading-relaxed whitespace-pre-wrap ql-editor-display prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: (activeProject.description || "").replace(/&nbsp;/g, ' ') }}
                      />
                    </div>

                    {/* Features */}
                    {activeProject.features && activeProject.features.length > 0 && (
                      <div>
                        <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                          Tính năng chính
                        </h3>
                        <ul className="grid sm:grid-cols-2 gap-3">
                          {activeProject.features.map((f, fi) => (
                            <li key={fi} className="flex gap-2 text-sm bg-muted/30 p-3 rounded-lg border border-border/50">
                              <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                              <span className="leading-relaxed">{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Gallery */}
                    {activeProject.images && activeProject.images.length > 0 && (
                      <div>
                        <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                          Ảnh
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {activeProject.images.map((img, imgIdx) => (
                            <button
                              key={imgIdx}
                              onClick={() => setLightbox({ list: activeProject.images!, index: imgIdx })}
                              className="group relative aspect-video rounded-lg overflow-hidden border border-border/50 hover:border-primary/50 transition-all shadow-sm hover:shadow-md"
                            >
                              <img src={img} alt={`Gallery ${imgIdx}`} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Video */}
                    {activeProject.youtubeUrl && youtubeId(activeProject.youtubeUrl) && (
                      <div>
                        <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                          Video
                        </h3>
                        <div className="relative aspect-video rounded-xl overflow-hidden border border-border shadow-sm bg-black">
                          <iframe
                            src={`https://www.youtube.com/embed/${youtubeId(activeProject.youtubeUrl)}?rel=0`}
                            title="YouTube video demo"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0 h-full w-full"
                          />
                        </div>
                      </div>
                    )}
                    {/* Links */}
                    <div className="p-5 rounded-xl border border-border bg-muted/10 space-y-3">
                      {activeProject.link ? (
                        <Button asChild className="w-full" size="lg">
                          <a href={activeProject.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 size-4" /> Mở dự án trực tiếp
                          </a>
                        </Button>
                      ) : (
                        <Button className="w-full" size="lg" disabled>
                          Chưa có link trực tiếp
                        </Button>
                      )}
                      
                      {activeProject.repo && (
                        <Button asChild variant="outline" className="w-full" size="lg">
                          <a href={activeProject.repo} target="_blank" rel="noopener noreferrer">
                            <Github className="mr-2 size-4" /> Xem mã nguồn (GitHub)
                          </a>
                        </Button>
                      )}
                    </div>

                    {/* Tech Stack */}
                    {activeProject.tech && activeProject.tech.length > 0 && (
                      <div>
                        <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-3">
                          Công nghệ sử dụng
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {activeProject.tech.map((item, ti) => (
                            <Badge key={ti} variant="secondary" className="px-2.5 py-1 text-xs">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
