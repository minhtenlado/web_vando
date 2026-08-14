import { notFound, redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Metadata } from "next"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { TableOfContents } from "@/components/cv/table-of-contents"
import { PostReader } from "@/components/cv/post-reader"
import { PostThemeToggle } from "@/components/cv/post-theme-toggle"
import { BackButton } from "@/components/cv/back-button"
import { GoogleAd } from "@/components/cv/google-ad"

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

      <main className="flex-1 container mx-auto max-w-[1800px] px-0 sm:px-4 md:px-8 py-3 sm:py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Left Sidebar: TOC (Sticky pinned when scrolling) */}
          <aside className="lg:w-64 lg:shrink-0 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto hidden lg:block">
            <TableOfContents selector=".prose" />
          </aside>

          {/* Center Content: Article */}
          <div className="flex-1 w-full min-w-0">
            <PostReader 
              title={post.title} 
              pubDate={pubDate} 
              readingTime={readingTime} 
              contentHtml={post.content}
              pdfUrl={post.pdfUrl}
            >
            {relatedPosts.length > 0 && (
              <div className="mt-16 pt-10 border-t border-border">
                <h3 className="text-xl font-bold font-serif mb-6 text-foreground">Đọc thêm bài viết khác</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relatedPosts.map(rp => {
                    const rpHref = `/posts/${rp.slug}`
                    return (
                      <a key={rp.id} href={rpHref} target="_blank" rel="noopener noreferrer" className="group block bg-card border border-border/50 hover:border-primary/50 p-5 rounded-xl transition-all hover:shadow-md">
                        <h4 className="font-semibold text-card-foreground group-hover:text-primary line-clamp-2 mb-2 transition-colors leading-snug">{rp.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{rp.excerpt}</p>
                      </a>
                    )
                  })}
                </div>
              </div>
            )}
            </PostReader>
          </div>
          
          {/* Right Sidebar: Ads */}
          <aside className="lg:w-[300px] xl:w-[336px] lg:shrink-0 lg:sticky lg:top-24 lg:self-start hidden lg:block">
            <div className="bg-card border border-border rounded-xl p-4 min-h-[300px] flex flex-col items-center justify-center text-muted-foreground text-sm font-medium shadow-sm overflow-hidden">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground/50 mb-4 font-mono">Quảng cáo</div>
              <GoogleAd 
                adClient="ca-pub-2941183923177148"
                adSlot="5044527787"
              />
            </div>
          </aside>
          
        </div>
      </main>
    </div>
  )
}
