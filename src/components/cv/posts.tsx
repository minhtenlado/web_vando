'use client'

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, Clock, ArrowRight, X, Calendar } from "lucide-react"
import { SectionHeader } from "./section-header"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useSiteData } from "@/components/cv/site-data-context"
import type { SitePost } from "@/lib/cv/site-data-server"
import { useLocale } from "@/components/cv/locale-context"

function formatDate(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  } catch {
    return ""
  }
}

export function Posts() {
  const { posts } = useSiteData()
  const { t, locale } = useLocale()
  const [active, setActive] = React.useState<SitePost | null>(null)
  const published = posts.filter((p) => p.published)

  if (published.length === 0) {
    return (
      <section id="posts" className="relative py-20 sm:py-28">
        <div className="container mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12">
          <SectionHeader
            index="07 / posts"
            title={t("Bài viết", "Posts")}
            subtitle={t(
              "Chia sẻ kỹ thuật và bài học từ thực chiến với hệ thống nhúng, RTOS và IoT.",
              "Technical sharing and lessons from real-world embedded systems, RTOS, and IoT."
            )}
          />
          <div className="mt-10 text-center text-muted-foreground p-12 border border-dashed rounded-xl border-border/60">
            {t("Chưa có bài viết nào được xuất bản.", "No posts published yet.")}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="posts" className="relative py-20 sm:py-28">
      <div className="container mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12">
        <SectionHeader
          index="07 / posts"
          title={t("Bài viết", "Posts")}
          subtitle={t(
            "Chia sẻ kỹ thuật và bài học từ thực chiến với hệ thống nhúng, RTOS và IoT.",
            "Technical sharing and lessons from real-world embedded systems, RTOS, and IoT."
          )}
        />

        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {published.map((post, i) => (
            <motion.button
              key={post.id}
              onClick={() => setActive(post)}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.06 }}
              className="text-left"
            >
              <Card className="group h-full p-5 border-border/60 bg-card/40 backdrop-blur hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className="grid place-items-center h-9 w-9 rounded-lg bg-primary/10 text-primary border border-primary/20">
                    <FileText className="h-4 w-4" />
                  </span>
                  <Badge variant="outline" className="gap-1 font-mono text-[10px]">
                    <Calendar className="h-3 w-3" /> {formatDate(post.createdAt, locale)}
                  </Badge>
                </div>
                <h3 className="text-base font-semibold leading-tight group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                  {post.excerpt}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-sm text-primary font-medium">
                  {t("Đọc tiếp", "Read more")} <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Post detail dialog */}
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="gap-1 font-mono text-[10px]">
                <Clock className="h-3 w-3" /> {active && formatDate(active.createdAt, locale)}
              </Badge>
            </div>
            <DialogTitle className="text-2xl">{active?.title}</DialogTitle>
            <DialogDescription className="text-base">
              {active?.excerpt}
            </DialogDescription>
          </DialogHeader>
          <article className="prose prose-sm dark:prose-invert max-w-none mt-2">
            {active && (
              <div 
                className="ql-editor-display text-foreground/90 my-2.5 text-sm"
                dangerouslySetInnerHTML={{ __html: active.content }}
              />
            )}
          </article>
        </DialogContent>
      </Dialog>
    </section>
  )
}
