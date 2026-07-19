import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { Metadata } from "next"
import { ArrowLeft, Clock, CalendarDays } from "lucide-react"
import Link from "next/link"
import { TableOfContents } from "@/components/cv/table-of-contents"
import { PostReader } from "@/components/cv/post-reader"
import { PostThemeToggle } from "@/components/cv/post-theme-toggle"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await db.post.findFirst({ where: { slug } })
  if (!post) return { title: "Post Not Found" }
  return {
    title: `${post.title} — Phan Huỳnh Văn Đô`,
    description: post.excerpt,
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await db.post.findFirst({ where: { slug } })
  
  if (!post) {
    notFound()
  }

  const relatedPosts = await db.post.findMany({
    where: {
      published: true,
      id: { not: post.id },
      locale: post.locale,
    },
    take: 3,
    orderBy: { createdAt: "desc" }
  })

  // Format dates
  const pubDate = new Date(post.createdAt).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  
  // Calculate reading time roughly
  const wordCount = post.content.replace(/<[^>]*>?/gm, "").split(/\s+/).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      {/* Top minimal header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-background/80 border-b border-border shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/#posts" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Trở về</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="font-mono text-sm font-semibold tracking-tight hidden sm:inline-block mr-2">
              <span className="text-primary">{"<"}</span>đô.dev<span className="text-primary">{"/>"}</span>
            </span>
            <PostThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto max-w-[1600px] px-4 md:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
          
          {/* Left Sidebar: TOC */}
          <aside className="lg:w-64 lg:shrink-0 lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
            <TableOfContents selector=".prose" />
          </aside>

          {/* Right Content: Article */}
          <PostReader 
            title={post.title} 
            pubDate={pubDate} 
            readingTime={readingTime} 
            contentHtml={post.content} 
          >
            {relatedPosts.length > 0 && (
              <div className="mt-16 pt-10 border-t border-border">
                <h3 className="text-xl font-bold font-serif mb-6 text-foreground">Đọc thêm bài viết khác</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relatedPosts.map(rp => (
                    <Link key={rp.id} href={`/posts/${rp.slug}`} className="group block bg-card border border-border/50 hover:border-primary/50 p-5 rounded-xl transition-all hover:shadow-md">
                      <h4 className="font-semibold text-card-foreground group-hover:text-primary line-clamp-2 mb-2 transition-colors leading-snug">{rp.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{rp.excerpt}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </PostReader>
          
        </div>
      </main>
    </div>
  )
}
