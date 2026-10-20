import { PreviewNotice } from '@/components/cv/content-state';
import '@/components/cv/detail-polish.css';
import { Footer } from '@/components/cv/footer';
import { LocaleProvider } from '@/components/cv/locale-context';
import { Navbar } from '@/components/cv/navbar';
import { PostReader } from '@/components/cv/post-reader';
import { RichContent } from '@/components/cv/rich-content';
import { SiteDataProvider } from '@/components/cv/site-data-context';
import { TableOfContents } from '@/components/cv/table-of-contents';
import { plainText } from '@/lib/cv/presentation';
import { normalizeProjectImage,normalizeProjectUrl } from '@/lib/cv/project-input';
import { getPostBySlug,getSiteData } from '@/lib/cv/site-data-server';
import { toPresentationData } from '@/lib/cv/site-presentation';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = (await cookies()).get('cv-locale')?.value === 'en' ? 'en' : 'vi';
  const post = await getPostBySlug(slug, locale);
  if (!post) return { title: 'Article not found | Engineering Lab', robots: { index: false } };
  const cover = normalizeProjectImage(post.coverImage);
  const title = (post.seoTitle || post.title) + ' | Engineering Lab';
  const description = plainText(post.seoDescription || post.excerpt).slice(0, 180);
  return {
    title, description, ...(post.seoKeywords ? { keywords: post.seoKeywords } : {}),
    alternates: { canonical: '/posts/' + encodeURIComponent(slug) },
    openGraph: { title, description, type: 'article', url: 'https://phanhuynh.id.vn/posts/' + encodeURIComponent(slug), publishedTime: post.createdAt, modifiedTime: post.updatedAt, ...(cover ? { images: [{ url: cover }] } : {}) },
    twitter: { card: 'summary_large_image', title, description, ...(cover ? { images: [cover] } : {}) },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const locale = (await cookies()).get('cv-locale')?.value === 'en' ? 'en' : 'vi';
  const [post, data] = await Promise.all([getPostBySlug(slug, locale), getSiteData(locale)]);
  if (!post) notFound();
  const cover = normalizeProjectImage(post.coverImage);
  const pdf = normalizeProjectUrl(post.pdfUrl, { allowRelative: true });
  const pubDate = new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', { dateStyle: 'long', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(post.createdAt));
  const words = plainText(post.content).split(/\s+/).filter(Boolean).length;
  const related = data.posts.filter((item) => item.id !== post.id && post.category && item.category === post.category).slice(0, 3);
  const jsonLd = { '@context': 'https://schema.org', '@type': 'TechArticle', headline: post.title, datePublished: post.createdAt, dateModified: post.updatedAt, description: plainText(post.excerpt), mainEntityOfPage: 'https://phanhuynh.id.vn/posts/' + encodeURIComponent(slug), ...(cover ? { image: [cover] } : {}) };

  return <LocaleProvider initialLocale={locale}><SiteDataProvider initialData={toPresentationData(data)}>
    <div className="lab-site">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <Navbar /><PreviewNotice />
      <main className="lab-container lab-article-page" id="main-content" tabIndex={-1}>
        <Link href="/notes" className="lab-detail-back">← {locale === 'vi' ? 'Tất cả bài viết' : 'All articles'}</Link>
        <div className="lab-reading-layout">
          <PostReader slug={post.slug} title={post.title} pubDate={pubDate} readingTime={Math.max(1, Math.ceil(words / 200))} coverImage={cover} pdfUrl={pdf} category={post.category} excerpt={plainText(post.excerpt)} views={post.views} likes={post.likes} preview={data.source === 'snapshot'}>
            <RichContent content={post.content} />
          </PostReader>
          <aside><TableOfContents /></aside>
        </div>
        {related.length > 0 && <section className="lab-related lab-related-articles"><h2>{locale === 'vi' ? 'Bài viết liên quan' : 'Related articles'}</h2><ul>{related.map((item) => <li key={item.id}><Link href={'/posts/' + encodeURIComponent(item.slug)}>{item.title}</Link></li>)}</ul></section>}
      </main>
      <Footer />
    </div>
  </SiteDataProvider></LocaleProvider>;
}
