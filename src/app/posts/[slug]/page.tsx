import { notFound, redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Metadata } from "next"
import { Search, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { TableOfContents } from "@/components/cv/table-of-contents"
import { PostReader } from "@/components/cv/post-reader"
import { PostThemeToggle } from "@/components/cv/post-theme-toggle"
import { GoogleAd } from "@/components/cv/google-ad"
import { ScientificProgress } from "@/components/cv/scientific-progress"
import { ScientificSearchTrigger } from "@/components/cv/scientific-search-trigger"

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
  const pubDate = new Date(post.createdAt).toLocaleDateString("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "short",
    day: "numeric",
  })
  
  // Calculate reading time roughly
  const wordCount = post.content.replace(/<[^>]*>?/gm, "").trim().split(/\s+/).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <div className="min-h-screen bg-[#f5f6f8] dark:bg-[#080a0d] text-[#181b21] dark:text-[#e7eaf0] transition-colors duration-500 font-sans">
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
      
      <ScientificProgress />

      {/* TOPBAR */}
      <header className="sticky top-0 z-[500] h-[66px] flex items-center justify-between px-4 sm:px-8 bg-white/80 dark:bg-[#080a0d]/75 border-b border-black/5 dark:border-white/5 backdrop-blur-[22px]">
        <Link href="/#posts" className="flex items-center gap-2 text-[13px] font-medium text-gray-500 hover:text-gray-900 dark:text-[#aeb4c0] dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Trở về</span>
        </Link>
        <div className="flex items-center gap-2">
           <ScientificSearchTrigger />
           <PostThemeToggle />
        </div>
      </header>

      {/* LAYOUT */}
      <main className="mx-auto max-w-[1840px] px-4 sm:px-8 md:px-10 lg:px-12 py-8 sm:py-12 pb-[100px] grid grid-cols-1 xl:grid-cols-[260px_1fr_320px] xl:gap-9 lg:grid-cols-[230px_1fr] lg:gap-8 items-start relative">
         
         {/* LEFT SIDEBAR */}
         <aside className="hidden lg:block sticky top-[94px] max-h-[calc(100vh-120px)] overflow-y-auto pr-3 custom-scrollbar">
            <div className="text-[11px] font-extrabold tracking-[0.16em] text-[#737a88] mb-5 uppercase">Nội dung</div>
            <TableOfContents selector=".prose" />
         </aside>
         
         {/* PAPER CONTENT */}
         <div className="min-w-0 w-full relative z-10">
            <PostReader 
              title={post.title} 
              pubDate={pubDate} 
              readingTime={readingTime} 
              contentHtml={post.content}
              pdfUrl={post.pdfUrl}
              authorName="Phan Huỳnh Văn Đô"
              authorRole="AI / Edge Computing"
              category={post.category || "Artificial Intelligence"}
              excerpt={post.excerpt}
            />
         </div>

         {/* RIGHT SIDEBAR */}
         <aside className="hidden xl:flex sticky top-[94px] h-[calc(100vh-120px)] flex-col justify-between">
            
            <div className="flex-1 min-h-0 flex flex-col mb-4 pt-1">
               <h3 className="font-sans text-[14px] font-semibold text-[#65676b] dark:text-[#b0b3b8] mb-2 px-2">
                 Được tài trợ
               </h3>
               <div className="w-full p-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">
                 <div className="w-full min-h-[250px] overflow-hidden mix-blend-multiply dark:mix-blend-normal">
                   <GoogleAd 
                   adClient="ca-pub-2941183923177148" 
                   adSlot="6308337137" 
                   format="fluid" 
                   layoutKey="-ef+6k-30-ac+ty" 
                 />
                 </div>
               </div>
            </div>

            <div className="p-5 border border-black/5 dark:border-white/5 rounded-[18px] bg-white/70 dark:bg-white/5 backdrop-blur-[18px] shrink-0">
               <div className="flex items-center gap-2 mb-4 font-sans text-[11px] font-extrabold tracking-[0.08em] text-[#8e96a5] uppercase">
                 AI Actions
               </div>
               <button className="w-full flex items-center justify-between mt-2 px-3 py-2.5 border border-black/5 dark:border-white/5 rounded-lg bg-white/50 dark:bg-white/5 text-xs text-gray-600 dark:text-[#bfc4ce] text-left transition-all hover:translate-x-1 hover:bg-primary/5 hover:border-primary/20 hover:text-primary">
                  ✦ Tóm tắt bài viết <span>→</span>
               </button>
               <button className="w-full flex items-center justify-between mt-2 px-3 py-2.5 border border-black/5 dark:border-white/5 rounded-lg bg-white/50 dark:bg-white/5 text-xs text-gray-600 dark:text-[#bfc4ce] text-left transition-all hover:translate-x-1 hover:bg-primary/5 hover:border-primary/20 hover:text-primary">
                  ◇ Giải thích phương pháp <span>→</span>
               </button>
               <button className="w-full flex items-center justify-between mt-2 px-3 py-2.5 border border-black/5 dark:border-white/5 rounded-lg bg-white/50 dark:bg-white/5 text-xs text-gray-600 dark:text-[#bfc4ce] text-left transition-all hover:translate-x-1 hover:bg-primary/5 hover:border-primary/20 hover:text-primary">
                  ≋ Tìm điểm quan trọng <span>→</span>
               </button>
               <button className="w-full flex items-center justify-between mt-2 px-3 py-2.5 border border-black/5 dark:border-white/5 rounded-lg bg-white/50 dark:bg-white/5 text-xs text-gray-600 dark:text-[#bfc4ce] text-left transition-all hover:translate-x-1 hover:bg-primary/5 hover:border-primary/20 hover:text-primary">
                  ⊕ So sánh nghiên cứu <span>→</span>
               </button>
            </div>
         </aside>
      </main>
    </div>
  )
}
