'use client';

import { formatContentDate,normalizeSearch,plainText } from '@/lib/cv/presentation';
import type { SitePost } from '@/lib/cv/site-data-server';
import { ArrowUpRight,Search } from 'lucide-react';
import Link from 'next/link';
import { useMemo,useState } from 'react';
import { ContentImage } from './content-image';
import { ContentError } from './content-state';
import { useLocale } from './locale-context';
import { useSiteData } from './site-data-context';

export function ArticleList({ posts, compact = false }: { posts: SitePost[]; compact?: boolean }) {
  const { locale } = useLocale();
  const Heading = compact ? 'h3' : 'h2';
  return <div className={'lab-article-list' + (compact ? ' lab-article-list-compact' : '')}>
    {posts.map((post) => <article className="lab-note-row" key={post.id}>
      <Link href={'/posts/' + encodeURIComponent(post.slug)}>
        {!compact && <div className="lab-note-cover"><ContentImage src={post.coverImage} alt="" sizes="(max-width: 560px) 100vw, 200px" /></div>}
        <div className="lab-note-copy">
          <p className="lab-note-meta">{post.category && <span>{post.category}</span>}{formatContentDate(post.createdAt, locale) && <time dateTime={post.createdAt}>{formatContentDate(post.createdAt, locale)}</time>}</p>
          <Heading>{post.title}</Heading>
          {post.excerpt && <p>{plainText(post.excerpt)}</p>}
        </div>
        <ArrowUpRight className="lab-row-arrow" size={17} aria-hidden="true" />
      </Link>
    </article>)}
  </div>;
}

export function NotesLibrary() {
  const { posts, errors, requestFailed, loading } = useSiteData();
  const { t } = useLocale();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');
  const [limit, setLimit] = useState(9);
  const published = useMemo(() => posts.filter((post) => post.published), [posts]);
  const categories = useMemo(() => Array.from(new Set(published.map((post) => post.category).filter((item): item is string => Boolean(item)))), [published]);
  const filtered = useMemo(() => published.filter((post) => (category === 'all' || post.category === category)
    && normalizeSearch([post.title, post.category, plainText(post.excerpt)].join(' ')).includes(normalizeSearch(query)))
    .sort((a, b) => (Date.parse(b.createdAt) - Date.parse(a.createdAt)) * (sort === 'newest' ? 1 : -1)), [published, query, category, sort]);
  const failed = Boolean(errors?.posts || requestFailed);

  return <>
    <header className="lab-library-heading"><h1>{t('Bài viết kỹ thuật', 'Technical articles')}</h1><p>{t('Ghi chép kỹ thuật, hướng dẫn triển khai và kết quả thử nghiệm.', 'Technical notes, implementation guides, and experiment results.')}</p></header>
    <div className="lab-library-controls">
      <div className="lab-search-sort">
        <label className="lab-search"><Search size={17} aria-hidden="true" /><span className="sr-only">{t('Tìm bài viết', 'Search articles')}</span><input type="search" value={query} onChange={(e) => { setQuery(e.target.value); setLimit(9); }} placeholder={t('Tìm bài viết…', 'Search articles…')} /></label>
        <label className="lab-sort"><span>{t('Sắp xếp', 'Sort')}</span><select value={sort} onChange={(e) => { setSort(e.target.value); setLimit(9); }}><option value="newest">{t('Mới nhất', 'Newest first')}</option><option value="oldest">{t('Cũ nhất', 'Oldest first')}</option></select></label>
      </div>
      <label className="lab-mobile-category lab-sort"><span>{t('Danh mục', 'Category')}</span><select value={category} onChange={(e) => { setCategory(e.target.value); setLimit(9); }}>{['all', ...categories].map((item) => <option key={item} value={item}>{item === 'all' ? t('Tất cả', 'All') : item}</option>)}</select></label>
      <div className="lab-filters" role="group" aria-label={t('Danh mục bài viết', 'Article categories')}>
        {['all', ...categories].map((item) => <button type="button" key={item} aria-pressed={item === category} onClick={() => { setCategory(item); setLimit(9); }}>{item === 'all' ? t('Tất cả', 'All') : item}</button>)}
      </div>
    </div>
    <ContentError resource="posts" />
    {loading && !posts.length ? <p className="lab-empty" role="status">{t('Đang tải bài viết…', 'Loading articles…')}</p>
      : filtered.length ? <ArticleList posts={filtered.slice(0, limit)} />
      : !failed && <div className="lab-empty" role="status"><p>{published.length ? t('Không tìm thấy bài viết phù hợp.', 'No matching articles.') : t('Chưa có bài viết được xuất bản.', 'No published articles yet.')}</p>{(query || category !== 'all') && <button type="button" className="lab-text-link" onClick={() => { setQuery(''); setCategory('all'); }}>{t('Xóa bộ lọc', 'Clear filters')}</button>}</div>}
    {!!published.length && <div className="lab-list-footer"><p role="status">{filtered.length} {t('bài viết', 'articles')}</p>{filtered.length > limit && <button className="lab-button" type="button" onClick={() => setLimit(limit + 9)}>{t('Xem thêm bài viết', 'Load more articles')}</button>}</div>}
  </>;
}
