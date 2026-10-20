import type { Metadata } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, FileText } from "lucide-react";
import { Footer } from "@/components/cv/footer";
import { Navbar } from "@/components/cv/navbar";
import { LocaleProvider } from "@/components/cv/locale-context";
import { SiteDataProvider } from "@/components/cv/site-data-context";
import { getSiteData } from "@/lib/cv/site-data-server";
import { toPresentationData } from "@/lib/cv/site-presentation";
import { plainText } from "@/lib/cv/presentation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Engineering Notes | Engineering Lab",
  description: "Technical articles and engineering notes on embedded systems, edge AI, IoT, and robotics.",
  alternates: { canonical: "/notes" },
};

function supportedImage(src?: string | null) {
  if (!src) return false;
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    const url = new URL(src);
    return url.protocol === "https:" && (url.hostname === "res.cloudinary.com" || url.hostname.endsWith(".public.blob.vercel-storage.com"));
  } catch {
    return false;
  }
}

function formatDate(value: string, locale: string) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "vi-VN", { dateStyle: "medium" }).format(date);
}

export default async function EngineeringNotesPage() {
  const locale = (await cookies()).get("cv-locale")?.value === "en" ? "en" : "vi";
  const initialData = toPresentationData(await getSiteData(locale));
  const posts = initialData.posts
    .filter((post) => post.published)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  return (
    <LocaleProvider initialLocale={locale}>
      <SiteDataProvider initialData={initialData}>
        <div className="lab-site">
          <Navbar />
          <main id="main-content" className="lab-container lab-notes-page">
            <Link href="/#projects" className="lab-notes-back"><ArrowLeft size={15} />{locale === "vi" ? "Tất cả dự án" : "All projects"}</Link>
            <p className="lab-eyebrow"><span>DOCUMENTATION</span> / ENGINEERING NOTES</p>
            <h1>{locale === "vi" ? "Ghi chú kỹ thuật" : "Engineering notes"}</h1>
            <p className="lab-notes-intro">{locale === "vi" ? "Bài viết và hướng dẫn kỹ thuật đã xuất bản." : "Published technical articles and guides."}</p>
            {posts.length ? (
              <div className="lab-notes-page-list">
                {posts.map((post) => (
                  <article className="lab-notes-page-card" key={post.id}>
                    {supportedImage(post.coverImage) ? (
                      <Link href={`/posts/${post.slug}`} className="lab-notes-cover">
                        <Image src={post.coverImage!} alt="" fill sizes="(max-width: 760px) 100vw, 280px" />
                      </Link>
                    ) : (
                      <div className="lab-notes-cover lab-notes-cover-empty" aria-hidden="true"><FileText /></div>
                    )}
                    <div className="lab-notes-page-copy">
                      <p className="lab-eyebrow"><span>{post.category || (locale === "vi" ? "GHI CHÚ KỸ THUẬT" : "ENGINEERING NOTE")}</span>{formatDate(post.createdAt, locale) && <time dateTime={post.createdAt}>{formatDate(post.createdAt, locale)}</time>}</p>
                      <h2><Link href={`/posts/${post.slug}`}>{post.title}</Link></h2>
                      <p>{plainText(post.excerpt)}</p>
                      <Link className="lab-note-read" href={`/posts/${post.slug}`}>{locale === "vi" ? "Đọc bài" : "Read article"}<ArrowUpRight size={15} /></Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="lab-empty"><FileText /><h2>{locale === "vi" ? "Chưa có ghi chú được xuất bản" : "No published notes yet"}</h2></div>
            )}
          </main>
          <Footer />
        </div>
      </SiteDataProvider>
    </LocaleProvider>
  );
}
