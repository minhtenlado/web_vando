'use client';

import dynamic from 'next/dynamic';
import { useEffect,useRef,useState,type ReactNode } from 'react';
import { ContentImage } from './content-image';
import { useLocale } from './locale-context';
import { PostEngagementBar } from './post-engagement-bar';

const PostComments = dynamic(() => import('./post-comments').then((module) => module.PostComments), { loading: () => <p role="status">Đang tải bình luận…</p> });

type Props = {
  slug: string; title: string; pubDate: string; readingTime: number; coverImage?: string | null;
  pdfUrl?: string | null; category?: string; excerpt?: string | null; views?: number; likes?: number;
  preview?: boolean; children?: ReactNode;
};

export function PostReader({ slug, title, pubDate, readingTime, coverImage, pdfUrl, category, excerpt, views = 0, likes = 0, preview = false, children }: Props) {
  const { t } = useLocale();
  const articleRef = useRef<HTMLElement>(null);
  const viewRequested = useRef(false);
  const [fontSize, setFontSize] = useState(17);
  const [currentViews, setCurrentViews] = useState(views);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);

  useEffect(() => {
    if (preview || viewRequested.current) return;
    try { if (sessionStorage.getItem('viewed_' + slug)) return; } catch { /* Track this mount only if storage is blocked. */ }
    viewRequested.current = true;
    void fetch('/api/posts/' + encodeURIComponent(slug) + '/stats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'view' }) })
      .then(async (response) => { if (!response.ok) return; const result = await response.json(); if (typeof result.views === 'number') setCurrentViews(result.views); try { sessionStorage.setItem('viewed_' + slug, 'true'); } catch { /* Optional session storage. */ } })
      .catch(() => { /* Reading remains available when counters are offline. */ });
  }, [slug, preview]);

  useEffect(() => {
    const blocks = articleRef.current?.querySelectorAll<HTMLElement>('pre, .ql-code-block-container');
    const cleanups: (() => void)[] = [];
    blocks?.forEach((block) => {
      if (block.closest('.lab-code-wrap')) return;
      const wrapper = document.createElement('div'); wrapper.className = 'lab-code-wrap';
      const button = document.createElement('button'); button.type = 'button'; button.className = 'lab-copy-code'; button.textContent = t('Sao chép mã', 'Copy code');
      let timer: ReturnType<typeof setTimeout>;
      const copy = async () => { try { const text = block.matches('.ql-code-block-container') ? Array.from(block.children).map((line) => line.textContent).join('\n') : block.textContent || ''; await navigator.clipboard.writeText(text); button.textContent = t('Đã sao chép', 'Copied'); } catch { button.textContent = t('Không sao chép được', 'Copy failed'); } timer = setTimeout(() => { button.textContent = t('Sao chép mã', 'Copy code'); }, 1800); };
      button.addEventListener('click', copy); block.before(wrapper); wrapper.append(button, block);
      cleanups.push(() => { clearTimeout(timer); button.removeEventListener('click', copy); wrapper.replaceWith(block); });
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [slug, children, t]);

  return <article className="lab-article" ref={articleRef}>
    <header className="lab-article-header">
      <p className="lab-detail-meta">{category && <span>{category}</span>}<span>{pubDate}</span><span>~{readingTime} {t('phút đọc', 'min read')}</span>{currentViews > 0 && <span>{currentViews} {t('lượt xem', 'views')}</span>}</p>
      <h1>{title}</h1>
      {excerpt && <p className="lab-detail-lead">{excerpt}</p>}
      <div className="lab-reading-tools" aria-label={t('Cỡ chữ bài viết', 'Article text size')}><span>{t('Cỡ chữ', 'Text size')}</span><button type="button" disabled={fontSize <= 15} onClick={() => setFontSize(fontSize - 1)} aria-label={t('Giảm cỡ chữ', 'Decrease text size')}>A−</button><button type="button" disabled={fontSize >= 23} onClick={() => setFontSize(fontSize + 1)} aria-label={t('Tăng cỡ chữ', 'Increase text size')}>A+</button></div>
    </header>
    {coverImage && <div className="lab-article-cover"><ContentImage src={coverImage} alt={title} sizes="(max-width: 800px) 100vw, 780px" priority fit="contain" /></div>}
    {pdfUrl && <details className="lab-pdf"><summary>{t('Tài liệu PDF', 'PDF document')}</summary><p><a href={pdfUrl} target="_blank" rel="noopener noreferrer">{t('Mở tài liệu', 'Open document')}</a></p><iframe src={pdfUrl} loading="lazy" title={t('Xem tài liệu PDF', 'PDF document preview')} /></details>}
    <div className="lab-prose ql-editor-display" style={{ fontSize }}>{children}</div>
    {!preview && <PostEngagementBar slug={slug} title={title} likes={likes} commentsCount={commentsCount} isCommentsOpen={commentsOpen} onToggleComments={() => setCommentsOpen(!commentsOpen)} />}
    {commentsOpen && <div id="comments-section"><PostComments slug={slug} title={title} onCommentCountChange={setCommentsCount} /></div>}
  </article>;
}
