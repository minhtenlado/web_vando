import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { Metadata } from "next"
import { ArrowLeft, Clock, CalendarDays } from "lucide-react"
import Link from "next/link"
import { TableOfContents } from "@/components/cv/table-of-contents"

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await db.post.findFirst({ where: { slug: params.slug } })
  if (!post) return { title: "Post Not Found" }
  return {
    title: `${post.title} — Phan Huỳnh Văn Đô`,
    description: post.excerpt,
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await db.post.findFirst({ where: { slug: params.slug } })
  
  if (!post) {
    notFound()
  }

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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top minimal header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-background/80 border-b border-border shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/#posts" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Trở về</span>
          </Link>
          <span className="font-mono text-sm font-semibold tracking-tight">
            <span className="text-primary">{"<"}</span>đô.dev<span className="text-primary">{"/>"}</span>
          </span>
        </div>
      </header>

      <main className="flex-1 container mx-auto max-w-7xl px-4 md:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
          
          {/* Left Sidebar: TOC */}
          <aside className="lg:w-64 shrink-0">
            <TableOfContents selector=".prose" />
          </aside>

          {/* Right Content: Article */}
          <article className="flex-1 w-full max-w-3xl mx-auto bg-background/50 border rounded-2xl p-6 sm:p-10 md:p-12 shadow-sm">
            <header className="mb-8 md:mb-12 border-b pb-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif leading-tight text-foreground mb-6">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" />
                  <time dateTime={post.createdAt.toISOString()}>{pubDate}</time>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{readingTime} phút đọc</span>
                </div>
              </div>
            </header>

            {/* Post Content */}
            <div 
              className="prose prose-sm sm:prose-base md:prose-lg prose-neutral dark:prose-invert max-w-none 
                font-serif 
                prose-headings:font-sans prose-headings:font-bold
                prose-a:text-primary hover:prose-a:text-primary/80
                prose-img:rounded-xl prose-img:shadow-md
                [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:rounded-xl [&_iframe]:shadow-md
                ql-editor-display"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>
          
        </div>
      </main>
    </div>
  )
}
