import { notFound } from "next/navigation"
import { getPostBySlug, getSiteData } from "@/lib/cv/site-data-server"
import type { Metadata } from "next"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { TableOfContents } from "@/components/cv/table-of-contents"
import { PostReader } from "@/components/cv/post-reader"
import { TutorialReader } from "@/components/cv/tutorial-reader"
import { PostAiChat } from "@/components/cv/post-ai-chat"
import { PostThemeToggle } from "@/components/cv/post-theme-toggle"

import { ScientificProgress } from "@/components/cv/scientific-progress"
import { ScientificSearchTrigger } from "@/components/cv/scientific-search-trigger"
import { RelatedPosts } from "@/components/cv/related-posts"
import "@/components/cv/detail-polish.css"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: "Post Not Found" }

  const title = (post.seoTitle || post.title) + " — Phan Huỳnh Văn Đô"
  const description = post.seoDescription || post.excerpt

  return {
    title,
    description,
    ...(post.seoKeywords ? { keywords: post.seoKeywords } : {}),
    alternates: {
      canonical: `/posts/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://phanhuynh.id.vn/posts/${slug}`,
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt || post.createdAt,
      authors: ["Phan Huỳnh Văn Đô"],
      ...(post.coverImage ? { images: [{ url: post.coverImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(post.coverImage ? { images: [post.coverImage] } : {}),
    },
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [post, siteData] = await Promise.all([getPostBySlug(slug), getSiteData("vi")])
  
  if (!post) {
    notFound()
  }

  const relatedPosts = siteData.posts
    .filter((item) => item.id !== post.id)
    .slice(0, 3)
    .map((item) => ({
      ...item,
      locale: "vi",
      category: item.category || "",
      layout: item.layout || "article",
      coverImage: item.coverImage || null,
      pdfUrl: item.pdfUrl || null,
      seoTitle: item.seoTitle || null,
      seoDescription: item.seoDescription || null,
      seoKeywords: item.seoKeywords || null,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt || item.createdAt),
    }))

  // Format dates
  const pubDate = new Date(post.createdAt).toLocaleDateString("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "short",
    day: "numeric",
  })
  
  // Calculate reading time roughly
  const wordCount = post.content.replace(/<[^>]*>?/gm, "").trim().split(/\s+/).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  const isTutorial = post.layout === "tutorial"
  const ContentReader = isTutorial ? TutorialReader : PostReader

  return (
    <div className="portfolio-detail post-detail min-h-screen font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": isTutorial ? "TechArticle" : "BlogPosting",
            "headline": post.title,
            "datePublished": post.createdAt,
            "dateModified": post.updatedAt || post.createdAt,
            "description": post.excerpt || post.seoDescription,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://phanhuynh.id.vn/posts/${slug}`
            },
            "author": { 
              "@type": "Person", 
              "name": "Phan Huỳnh Văn Đô",
              "url": "https://phanhuynh.id.vn" 
            },
            "publisher": {
              "@type": "Person",
              "name": "Phan Huỳnh Văn Đô",
              "url": "https://phanhuynh.id.vn"
            },
            ...(post.coverImage ? { "image": [post.coverImage] } : {})
          }).replace(/</g, "\\u003c")
        }}
      />
      
      <ScientificProgress />

      {/* TOPBAR */}
      <header className="detail-topbar post-topbar sticky top-0 z-[500] flex items-center justify-between px-4 sm:px-8 border-b backdrop-blur-[22px]">
        <Link href="/#posts" className="detail-back flex items-center gap-2 text-[13px] font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Về Portfolio</span>
        </Link>
        <Link href="/" className="detail-wordmark hidden sm:flex items-center gap-2">
          <span className="detail-monogram">PH.</span>
          <span>Field notes</span>
        </Link>
        <div className="flex items-center gap-2">
           <ScientificSearchTrigger />
           <PostThemeToggle />
        </div>
      </header>

      {/* LAYOUT */}
      <main className="post-layout mx-auto max-w-[1600px] px-4 sm:px-8 md:px-10 lg:px-12 py-8 sm:py-12 pb-[100px] grid grid-cols-1 xl:grid-cols-[200px_minmax(0,1fr)_280px] xl:gap-8 lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-8 items-start relative">
         
         {/* LEFT SIDEBAR */}
         <aside className="post-toc hidden lg:block sticky top-[110px] max-h-[calc(100vh-140px)] overflow-y-auto pr-3 custom-scrollbar" aria-label="Mục lục bài viết">
            <div className="detail-eyebrow mb-5">Trong bài viết</div>
            <TableOfContents selector=".prose, .tutorial-prose" />
         </aside>
         
         {/* PAPER CONTENT */}
         <div className="post-content min-w-0 w-full relative z-10">
            <ContentReader 
              slug={post.slug}
              title={post.title} 
              pubDate={pubDate} 
              readingTime={readingTime} 
              contentHtml={post.content}
              coverImage={post.coverImage}
              pdfUrl={post.pdfUrl}
              authorName="Phan Huỳnh Văn Đô"
              authorRole="AI / Edge Computing"
              category={post.category || "Artificial Intelligence"}
              excerpt={post.excerpt}
              views={post.views}
              likes={post.likes}
            />
            {relatedPosts && relatedPosts.length > 0 && (
              <div className="post-related"><RelatedPosts posts={relatedPosts} /></div>
            )}
         </div>

         {/* RIGHT SIDEBAR */}
         <aside className="post-assistant hidden xl:flex sticky top-[110px] h-[calc(100vh-140px)] flex-col justify-between" aria-label="Trợ lý AI cho bài viết">
            <PostAiChat postTitle={post.title} postContent={post.content} isFloating={false} />
         </aside>
      </main>

      <footer className="detail-footer px-4 sm:px-8 py-8 border-t">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between gap-5 text-xs">
          <span>Phan Huỳnh Văn Đô · Ideas, experiments & engineering.</span>
          <Link href="/#posts" className="inline-flex items-center gap-1.5 shrink-0">
            Các bài viết <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </footer>

      {/* Floating AI Chat for mobile/tablet */}
      <div className="post-mobile-assistant xl:hidden fixed bottom-6 right-6 z-[600]">
         <PostAiChat postTitle={post.title} postContent={post.content} isFloating={true} />
      </div>
    </div>
  )
}
