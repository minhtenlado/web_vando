'use client'

import * as React from "react"
import { motion } from "framer-motion"
import { Clock, Eye, Heart, Bookmark, Search, Star, Crown, ArrowUpRight } from "lucide-react"
import { SectionHeader } from "./section-header"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSiteData } from "@/components/cv/site-data-context"
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

const CATEGORIES = ["AI", "embedded", "IOT", "Robot", "ROS2"]

export function Posts() {
  const { posts, profile } = useSiteData()
  const { t, locale } = useLocale()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState("Tất cả")
  
  const published = posts.filter((p) => {
    if (!p.published) return false
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    const cat = p.category || CATEGORIES[0]
    if (activeCategory !== "Tất cả" && activeCategory !== cat) return false
    return true
  })

  if (posts.filter((p) => p.published).length === 0) {
    return (
      <section className="relative py-8 sm:py-12 scroll-mt-16 md:scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
          <SectionHeader
            index="07 / posts"
            title={t("Bài viết", "Posts")}
            subtitle=""
          />
          <div className="mt-10 text-center text-muted-foreground p-12 border border-dashed rounded-2xl border-border/60">
            {t("Chưa có bài viết nào được xuất bản.", "No posts published yet.")}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative py-8 sm:py-12 scroll-mt-16 md:scroll-mt-20">
      <div className="container mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <SectionHeader
          index="07 / posts"
          title={t("Bài viết", "Posts")}
          subtitle=""
        />

        {/* Toolbar */}
        <div className="mt-8 flex flex-col xl:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
            <Button 
              variant="default" 
              onClick={() => setActiveCategory("Tất cả")}
              className={`rounded-full h-8 px-4 text-xs font-medium border-none ${activeCategory === "Tất cả" ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'bg-transparent text-muted-foreground hover:bg-white/5'}`}
            >
              Tất cả
            </Button>
            {CATEGORIES.map(cat => (
              <Button 
                key={cat} 
                variant="outline" 
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full h-8 px-4 text-xs font-medium border-border/40 hover:bg-white/5 ${activeCategory === cat ? 'bg-primary/20 text-primary border-primary/30' : 'bg-transparent text-muted-foreground'}`}
              >
                {cat}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-end">
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("Tìm bài viết...", "Search posts...")} 
                className="w-full pl-9 h-8 rounded-md border-border/40 bg-transparent text-xs focus-visible:ring-1 focus-visible:ring-primary/20"
              />
            </div>
            <div className="flex gap-2">
            </div>
          </div>
        </div>

        {/* Post Grid */}
        <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {published.map((post, i) => (
            <PostCardItem key={post.id} post={post} i={i} />
          ))}
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

function PostCardItem({ post, i }: { post: any, i: number }) {
  const { profile } = useSiteData()
  const { locale } = useLocale()
  
  const [likes, setLikes] = React.useState(post.likes || 0)
  const [bookmarks, setBookmarks] = React.useState(post.bookmarks || 0)
  const [hasLiked, setHasLiked] = React.useState(false)
  const [hasBookmarked, setHasBookmarked] = React.useState(false)

  React.useEffect(() => {
    setHasLiked(localStorage.getItem(`like_${post.slug}`) === "true")
    setHasBookmarked(localStorage.getItem(`bookmark_${post.slug}`) === "true")
  }, [post.slug])

  const handleInteract = async (e: React.MouseEvent, type: "like" | "bookmark") => {
    e.preventDefault()
    e.stopPropagation()

    const isLike = type === "like"
    const currentState = isLike ? hasLiked : hasBookmarked
    const action = isLike ? (currentState ? "unlike" : "like") : (currentState ? "unbookmark" : "bookmark")

    if (isLike) {
      setHasLiked(!currentState)
      setLikes(prev => currentState ? Math.max(0, prev - 1) : prev + 1)
      localStorage.setItem(`like_${post.slug}`, (!currentState).toString())
    } else {
      setHasBookmarked(!currentState)
      setBookmarks(prev => currentState ? Math.max(0, prev - 1) : prev + 1)
      localStorage.setItem(`bookmark_${post.slug}`, (!currentState).toString())
    }

    try {
      await fetch(`/api/posts/${post.slug}/stats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
    } catch (err) {
      console.error(err)
    }
  }

  const targetHref = `/posts/${post.slug}`
  const postCategory = post.category || CATEGORIES[0]
  const readTime = `${Math.ceil((post.content?.length || 0) / 1000)} phút đọc`

  return (
    <motion.div
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
        className="block h-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-[1.2rem]"
      >
        <Card className="group h-full flex flex-col overflow-hidden border-border/20 bg-white dark:bg-[#0d120f] hover:border-primary/30 transition-all duration-300 rounded-[1.2rem] relative shadow-lg shadow-black/5 dark:shadow-black/20">
          <div className="p-5 flex flex-col flex-1 bg-gradient-to-b from-white to-gray-50 dark:from-[#111713] dark:to-[#0a0d0b]">
            {/* Category Badge */}
            <Badge className="bg-primary/90 hover:bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-sm mb-4 w-fit flex items-center gap-1.5 uppercase shadow-md shadow-primary/20">
              {postCategory}
            </Badge>

            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white/90 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
              {post.title}
            </h3>
            <p className="mt-2.5 text-[13px] text-muted-foreground leading-relaxed line-clamp-2 flex-1">
              {post.excerpt}
            </p>

            {/* Author */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-[#1e2923] flex items-center justify-center overflow-hidden shrink-0 border border-border/10 dark:border-white/10">
                  {profile?.avatar ? (
                    <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-gray-900 dark:text-white">Z</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-medium text-gray-900 dark:text-white/80 leading-none">{profile?.name || "Nguyễn Minh Đức"}</span>
                  <span className="text-[11px] text-muted-foreground mt-1">{profile?.role || "Chief Executive Officer"}</span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
            </div>

            {/* Footer Stats */}
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/10 dark:border-white/5">
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> {readTime}
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" /> {(post.views || 0)}
                </div>
              </div>
              <span className="text-[11px] text-muted-foreground">{formatDate(post.createdAt, locale)}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-4">
              <div 
                onClick={(e) => handleInteract(e, "like")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border/20 dark:border-white/5 text-[11px] transition-colors cursor-pointer ${hasLiked ? 'bg-primary/10 text-primary dark:text-primary border-primary/20' : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground dark:hover:text-white'}`}
              >
                <Heart className={`w-3 h-3 ${hasLiked ? 'fill-current' : ''}`} /> {likes}
              </div>
              <div 
                onClick={(e) => handleInteract(e, "bookmark")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border/20 dark:border-white/5 text-[11px] transition-colors cursor-pointer ${hasBookmarked ? 'bg-primary/10 text-primary dark:text-primary border-primary/20' : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground dark:hover:text-white'}`}
              >
                <Bookmark className={`w-3 h-3 ${hasBookmarked ? 'fill-current' : ''}`} /> {bookmarks}
              </div>
            </div>

          </div>
        </Card>
      </a>
    </motion.div>
  )
}
