import { Post } from "@prisma/client"
import Link from "next/link"
import Image from "next/image"
import { CalendarDays, Eye } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

export function RelatedPosts({ posts }: { posts: Post[] }) {
  if (!posts || posts.length === 0) return null

  return (
    <div className="mt-16 w-full pt-10 border-t border-black/10 dark:border-white/10 relative z-20">
      <h3 className="text-xl font-sans font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <span className="w-2 h-6 rounded-full bg-emerald-500"></span>
        Bài viết liên quan
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {posts.map(post => (
          <Link 
            href={`/posts/${post.slug}`} 
            key={post.id} 
            className="group block rounded-2xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-[#111419]/50 backdrop-blur-sm overflow-hidden hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            {post.coverImage && (
              <div className="aspect-[16/9] w-full relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                <Image 
                  src={post.coverImage} 
                  alt={post.title} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-105" 
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            )}
            <div className="p-5">
              <h4 className="text-[15px] font-bold font-sans text-gray-900 dark:text-[#eef2f7] line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {post.title}
              </h4>
              <p className="mt-2 text-[13px] text-gray-500 dark:text-[#8995a2] line-clamp-2 leading-relaxed">
                {post.excerpt}
              </p>
              <div className="mt-5 flex items-center gap-4 text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {format(new Date(post.createdAt), 'dd MMMM, yyyy', { locale: vi })}
                </span>
                {post.views > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    {post.views} lượt xem
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
