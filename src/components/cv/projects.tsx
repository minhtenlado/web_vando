'use client'

import * as React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Github, ExternalLink, CheckCircle2, FolderGit2 } from "lucide-react"
import { SectionHeader } from "./section-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { projects } from "@/lib/cv/data"

export function Projects() {
  return (
    <section id="projects" className="relative py-20 sm:py-28 bg-muted/20">
      <div className="container mx-auto max-w-6xl px-4">
        <SectionHeader
          index="04 / projects"
          title="Dự án tiêu biểu"
          subtitle="Một vài dự án tôi tự hào nhất — từ sản phẩm thương mại đến dự án mã nguồn mở cộng đồng."
        />

        <div className="mt-10 grid md:grid-cols-2 gap-6">
          {projects.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
            >
              <Card className="group h-full overflow-hidden border-border/60 bg-card/40 backdrop-blur hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                {/* Image */}
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
                  <h3 className="text-lg font-semibold leading-tight">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {p.description}
                  </p>

                  <ul className="mt-4 space-y-1.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {p.tech.map((t) => (
                      <Badge
                        key={t}
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
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Button asChild variant="outline" size="lg">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-4 w-4 mr-2" /> Xem thêm trên GitHub
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
