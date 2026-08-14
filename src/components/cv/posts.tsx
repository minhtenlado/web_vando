'use client'

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, Clock, ArrowRight, X, Calendar, Search } from "lucide-react"
import { SectionHeader } from "./section-header"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useSiteData } from "@/components/cv/site-data-context"
import type { SitePost } from "@/lib/cv/site-data-server"
import { useLocale } from "@/components/cv/locale-context"

function formatDate(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
      timeZone: "Asia/Ho_Chi_Minh",
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  } catch {
    return ""
  }
}

export function Posts() {
  const { posts, profile } = useSiteData()
  const { t, locale } = useLocale()
  const [searchQuery, setSearchQuery] = React.useState("")
  
  const published = posts.filter((p) => {
    if (!p.published) return false
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  if (posts.filter((p) => p.published).length === 0) {
    return (
      <section id="posts" className="relative py-8 sm:py-12 scroll-mt-16 md:scroll-mt-20">
        <div className="container mx-auto max-w-5xl px-4 md:px-8 lg:px-12">
          <SectionHeader
            index="07 / posts"
            title={t("Bài viết", "Posts")}
            subtitle={t(
              "Chia sẻ kỹ thuật và bài học từ thực chiến với hệ thống nhúng, RTOS và IoT.",
              "Technical sharing and lessons from real-world embedded systems, RTOS, and IoT."
            )}
          />
          <div className="mt-10 text-center text-muted-foreground p-12 border border-dashed rounded-2xl border-border/60">
            {t("Chưa có bài viết nào được xuất bản.", "No posts published yet.")}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="posts" className="relative py-8 sm:py-12 scroll-mt-16 md:scroll-mt-20">
      <div className="container mx-auto max-w-[1000px] px-4 md:px-8 lg:px-12">
        <SectionHeader
          index="07 / posts"
          title={t("Bài viết", "Posts")}
          subtitle={t(
            "Chia sẻ kỹ thuật và bài học từ thực chiến với hệ thống nhúng, RTOS và IoT.",
            "Technical sharing and lessons from real-world embedded systems, RTOS, and IoT."
          )}
        />

        {/* Toolbar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex-1 max-w-md w-full relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("Tìm bài viết...", "Search posts...")} 
              className="w-full pl-9 rounded-full border-border/60 bg-background/50 focus-visible:ring-primary/20"
            />
          </div>

          <div className="flex items-center gap-2 sm:w-auto w-full justify-center">
            <Button variant="outline" className="rounded-full border-border/60 hover:bg-primary/5 flex-1 sm:flex-none">
              👑 {t("CEO", "CEO")}
            </Button>
            <Button variant="outline" className="rounded-full border-border/60 hover:bg-primary/5 flex-1 sm:flex-none">
              ⭐ {t("Nổi bật", "Featured")}
            </Button>
          </div>
        </div>

        {/* Post Grid */}
        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {published.map((post, i) => {
            const targetHref = `/posts/${post.slug}`
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: (i % 3) * 0.06 }}
                className="h-full"
              >
                <a 
                  href={targetHref} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block h-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-[2rem]"
                >
                  <Card className="group h-full flex flex-col overflow-hidden border-border/60 bg-card/40 backdrop-blur hover:border-primary/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10 rounded-[2rem]">
                    
                    {/* Image Placeholder */}
                    <div className="h-48 w-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative overflow-hidden border-b border-border/40">
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/40 via-transparent to-transparent"></div>
                      <FileText className="h-10 w-10 text-primary/30" />
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                        {post.excerpt}
                      </p>

                      <hr className="my-4 border-border/60" />

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20 shrink-0">
                            {profile?.avatar ? (
                              <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-xs font-bold text-primary">{profile?.name?.charAt(0) || "U"}</span>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold leading-none">{profile?.name || "Author"}</span>
                            <span className="text-[11px] text-muted-foreground mt-1">{formatDate(post.createdAt, locale)}</span>
                          </div>
                        </div>
                        
                        {post.pdfUrl && (
                          <Badge variant="secondary" className="font-mono text-[10px]">
                            PDF
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                </a>
              </motion.div>
            )
          })}
        </div>
        
        {published.length === 0 && searchQuery && (
          <div className="mt-10 text-center text-muted-foreground p-12 border border-dashed rounded-3xl border-border/60">
            {t("Không tìm thấy bài viết nào phù hợp.", "No posts found matching your search.")}
          </div>
        )}
      </div>

    </section>
  )
}
