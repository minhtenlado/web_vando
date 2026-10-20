import '@/components/cv/detail-polish.css';
import { LocaleProvider } from '@/components/cv/locale-context';
import { PostReader } from '@/components/cv/post-reader';
import { RichContent } from '@/components/cv/rich-content';
import { isAuthed } from '@/lib/auth';
import { plainText } from '@/lib/cv/presentation';
import { normalizeProjectImage,normalizeProjectUrl } from '@/lib/cv/project-input';
import { ContentUnavailableError } from '@/lib/cv/site-data-server';
import { db } from '@/lib/db';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound,redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Article preview | Engineering Lab', robots: { index: false, follow: false, noarchive: true } };

export default async function PostPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) redirect('/admin');
  const { id } = await params;
  let post;
  try { post = await db.post.findUnique({ where: { id } }); }
  catch { throw new ContentUnavailableError(); }
  if (!post) notFound();
  const words = plainText(post.content).split(/\s+/).filter(Boolean).length;
  return <LocaleProvider><div className="lab-site"><div className="lab-preview-notice">Admin preview · {post.published ? 'Published' : 'Draft'} · <Link href="/admin">Return to Admin</Link></div>
    <main id="main-content" className="lab-container lab-article-page"><PostReader slug={post.slug} title={post.title} pubDate={post.createdAt.toLocaleDateString('vi-VN')} readingTime={Math.max(1, Math.ceil(words / 200))} coverImage={normalizeProjectImage(post.coverImage)} pdfUrl={normalizeProjectUrl(post.pdfUrl, { allowRelative: true })} excerpt={post.excerpt} category={post.category} preview><RichContent content={post.content} /></PostReader></main>
  </div></LocaleProvider>;
}
