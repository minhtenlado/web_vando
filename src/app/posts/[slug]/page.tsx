import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { Metadata } from "next"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { TableOfContents } from "@/components/cv/table-of-contents"
import { PostReader } from "@/components/cv/post-reader"
import { PostThemeToggle } from "@/components/cv/post-theme-toggle"
import { BackButton } from "@/components/cv/back-button"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await db.post.findFirst({ where: { slug, published: true } })
  if (!post) return { title: "Post Not Found" }

  const title = (post.seoTitle || post.title) + " — Phan Huỳnh Văn Đô"
  const description = post.seoDescription || post.excerpt

  return {
    title,
    description,
    ...(post.seoKeywords ? { keywords: post.seoKeywords } : {}),
    openGraph: {
      title,
      description,
      type: "article",
      url: `/posts/${slug}`,
    }
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await db.post.findFirst({ where: { slug, published: true } })
  
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
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  
  // Calculate reading time roughly
  const wordCount = post.content.replace(/<[^>]*>?/gm, "").trim().split(/\s+/).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  const isPdfMode = !!(post.pdfUrl && (!post.content || post.content.trim() === "<p><br></p>" || post.content.trim() === ""))

  if (isPdfMode) {
    return (
      <div className="h-screen w-screen flex flex-col overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              "headline": post.title,
              "datePublished": post.createdAt,
              "description": post.excerpt,
              "author": { "@type": "Person", "name": "Phan Huỳnh Văn Đô" }
            })
          }}
        />
        <header className="flex-none h-14 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-border/50 px-4 md:px-6 flex items-center justify-between z-50">
          <div className="flex items-center gap-3">
            <BackButton />
          </div>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 pl-4">
            <a href={post.pdfUrl!} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 flex items-center gap-2">
              <span className="hidden sm:inline">Tải</span> PDF
            </a>
            <div className="w-px h-4 bg-border shrink-0"></div>
            <PostThemeToggle />
          </div>
        </header>
        <main className="flex-1 w-full h-full relative bg-zinc-100/50 dark:bg-zinc-900/50">
          <iframe
            src={`${post.pdfUrl!}#view=FitH&toolbar=0`}
            className="absolute inset-0 w-full h-full border-0"
            title={post.title}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "datePublished": post.createdAt,
            "description": post.excerpt,
            "author": { "@type": "Person", "name": "Phan Huỳnh Văn Đô" }
          })
        }}
      />
      {/* Top minimal header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-background/80 border-b border-border shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 md:px-8 h-16 flex items-center justify-between">
          <BackButton />
          <div className="flex items-center gap-4">
            <span className="font-mono text-sm font-semibold tracking-tight hidden sm:inline-block mr-2">
              Phan Huỳnh Văn Đô
            </span>
            <PostThemeToggle />
          </div>
        </div>
      </header>

      <main className={`flex-1 container mx-auto max-w-[1600px] ${isPdfMode ? "px-0 py-0 sm:px-4 md:px-8 sm:py-8 lg:py-12 flex flex-col" : "px-4 md:px-8 py-8 lg:py-12"}`}>
        <div className={`flex flex-col lg:flex-row gap-8 lg:gap-16 items-start ${isPdfMode ? "justify-center flex-1" : ""}`}>
          
          {/* Left Sidebar: TOC (Sticky pinned when scrolling) */}
          <aside className="lg:w-64 lg:shrink-0 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto hidden lg:block">
            <TableOfContents selector=".prose" />
          </aside>

          {/* Right Content: Article */}
          <div className="flex-1 w-full">
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
                    <a key={rp.id} href={`/posts/${rp.slug}`} target="_blank" rel="noopener noreferrer" className="group block bg-card border border-border/50 hover:border-primary/50 p-5 rounded-xl transition-all hover:shadow-md">
                      <h4 className="font-semibold text-card-foreground group-hover:text-primary line-clamp-2 mb-2 transition-colors leading-snug">{rp.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{rp.excerpt}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}
            </PostReader>
          </div>
          
        </div>
      </main>
    </div>
  )
}
