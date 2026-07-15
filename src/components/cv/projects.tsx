'use client'

import * as React from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Github, ExternalLink, CheckCircle2, FolderGit2, Play, X } from "lucide-react"
import { SectionHeader } from "./section-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useSiteData } from "@/components/cv/site-data-context"
import { profile } from "@/lib/cv/data"

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
  const { projects } = useSiteData()
  const [activeVideo, setActiveVideo] = React.useState<string | null>(null)
  const activeId = activeVideo ? youtubeId(activeVideo) : null

  return (
    <section id="projects" className="relative py-20 sm:py-28 bg-muted/20">
      <div className="container mx-auto max-w-6xl px-4">
        <SectionHeader
          index="04 / projects"
          title="Dự án tiêu biểu"
          subtitle="Một vài dự án tôi tự hào nhất — từ sản phẩm thương mại đến dự án mã nguồn mở cộng đồng. Nhấn nút video để xem demo."
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
                    <Image
                      src={p.image}
                      alt={`Ảnh minh họa dự án ${p.title}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 600px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <Badge className="gap-1 bg-background/80 backdrop-blur text-foreground border-border">
                        <FolderGit2 className="h-3 w-3" /> {p.category}
                      </Badge>
                    </div>

                    {/* Play button if YouTube */}
                    {ytId && (
                      <button
                        onClick={() => setActiveVideo(p.youtubeUrl!)}
                        aria-label={`Xem video demo ${p.title}`}
                        className="absolute inset-0 grid place-items-center group/play"
                      >
                        <span className="relative grid place-items-center h-16 w-16 rounded-full bg-background/80 backdrop-blur border border-border shadow-lg transition-transform group-hover/play:scale-110">
                          <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                          <Play className="h-7 w-7 text-primary fill-primary translate-x-0.5" />
                        </span>
                      </button>
                    )}

                    <div className="absolute bottom-3 right-3 flex gap-2">
                      {p.repo && (
                        <a
                          href={p.repo}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Xem mã nguồn ${p.title} trên GitHub`}
                          className="grid place-items-center h-8 w-8 rounded-md bg-background/80 backdrop-blur border border-border hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          <Github className="h-4 w-4" />
                        </a>
                      )}
                      {p.link && (
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Mở demo dự án ${p.title}`}
                          className="grid place-items-center h-8 w-8 rounded-md bg-background/80 backdrop-blur border border-border hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-semibold leading-tight">
                        {p.title}
                      </h3>
                      {ytId && (
                        <Badge variant="secondary" className="gap-1 shrink-0">
                          <Play className="h-3 w-3" /> Demo
                        </Badge>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {p.description}
                    </p>

                    <ul className="mt-4 space-y-1.5">
                      {p.features.map((f, fi) => (
                        <li key={fi} className="flex gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {p.tech.map((t, ti) => (
                        <Badge
                          key={ti}
                          variant="outline"
                          className="font-mono text-[10px] py-0.5"
                        >
                          {t}
                        </Badge>
                      ))}
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
              <Github className="h-4 w-4 mr-2" /> Xem thêm trên GitHub
            </a>
          </Button>
        </div>
      </div>

      {/* YouTube lightbox */}
      <AnimatePresence>
        {activeId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveVideo(null)}
            className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-sm grid place-items-center p-4"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl"
            >
              <button
                onClick={() => setActiveVideo(null)}
                aria-label="Đóng video"
                className="absolute -top-12 right-0 grid place-items-center h-9 w-9 rounded-md bg-card border border-border hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="relative aspect-video rounded-xl overflow-hidden border border-border shadow-2xl bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${activeId}?autoplay=1&rel=0`}
                  title="YouTube video demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
