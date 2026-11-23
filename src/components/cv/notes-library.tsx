'use client';

import { formatContentDate,normalizeSearch,plainText } from '@/lib/cv/presentation';
import { normalizeProjectImage } from '@/lib/cv/project-input';
import type { SitePost } from '@/lib/cv/site-data-server';
import { ArrowRight,ChevronRight,FileText,Search } from 'lucide-react';
import Link from 'next/link';
import { useMemo,useState } from 'react';
import { CategoryFilters } from './category-filters';
import { ContentImage } from './content-image';
import { ContentError } from './content-state';
import { useLocale } from './locale-context';
import { useSiteData } from './site-data-context';

export function ArticleList({ posts, headingLevel = 3 }: { posts: SitePost[]; compact?: boolean; headingLevel?: 2 | 3 }) {
  const { locale, t } = useLocale();
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return <div className="ui-note-grid">
    {posts.map((post) => {
      const date = formatContentDate(post.createdAt, locale);
      return <article className="ui-note-card" key={post.id}>
        <Link href={'/posts/' + encodeURIComponent(post.slug)}>
          <div className="ui-note-media">
            {normalizeProjectImage(post.coverImage)
              ? <ContentImage src={post.coverImage} alt="" fit="cover" sizes="(max-width: 640px) calc(100vw - 40px), (max-width: 1100px) 46vw, 380px" />
              : <div className="ui-note-placeholder" aria-hidden="true"><FileText size={26} /><span>{post.category || 'Engineering Notes'}</span></div>}
          </div>
          <div className="ui-note-body">
            <p className="ui-note-meta">{post.category && <span className="ui-note-category">{post.category}</span>}{date && <time dateTime={post.createdAt}>{date}</time>}</p>
            <Heading>{post.title}</Heading>
            {post.excerpt && <p>{plainText(post.excerpt)}</p>}
            <span className="ui-read-more">{t('Đọc bài viết', 'Read article')}<ArrowRight size={15} aria-hidden="true" /></span>
          </div>
        </Link>
      </article>;
    })}
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
  const counts = useMemo(() => Object.fromEntries([['all', published.length], ...categories.map((item) => [item, published.filter((post) => post.category === item).length])]), [published, categories]);
  const filtered = useMemo(() => published.filter((post) => (category === 'all' || post.category === category)
    && normalizeSearch([post.title, post.category, plainText(post.excerpt)].join(' ')).includes(normalizeSearch(query)))
    .sort((a, b) => (Date.parse(b.createdAt) - Date.parse(a.createdAt)) * (sort === 'newest' ? 1 : -1)), [published, query, category, sort]);
  const failed = Boolean(errors?.posts || requestFailed);

  return <>
    <header className="ui-page-header">
      <nav className="ui-breadcrumb" aria-label="Breadcrumb"><Link href="/">{t('Trang chủ', 'Home')}</Link><ChevronRight size={14} aria-hidden="true" /><span aria-current="page">{t('Bài viết', 'Articles')}</span></nav>
      <p className="ui-kicker">Engineering Notes</p>
      <h1>{t('Bài viết kỹ thuật', 'Technical articles')}</h1>
      <p>{t('Ghi chép kỹ thuật, hướng dẫn triển khai và kết quả thử nghiệm từ các dự án trong phòng lab.', 'Technical notes, implementation guides and experiment results from lab projects.')}</p>
    </header>
    <div className="ui-toolbar">
      <div className="ui-toolbar-row">
        <label className="lab-search"><Search size={17} aria-hidden="true" /><span className="sr-only">{t('Tìm bài viết', 'Search articles')}</span><input type="search" value={query} onChange={(e) => { setQuery(e.target.value); setLimit(9); }} placeholder={t('Tìm bài viết…', 'Search articles…')} /></label>
        <label className="lab-sort"><span>{t('Sắp xếp', 'Sort')}</span><select value={sort} onChange={(e) => { setSort(e.target.value); setLimit(9); }}><option value="newest">{t('Mới nhất', 'Newest first')}</option><option value="oldest">{t('Cũ nhất', 'Oldest first')}</option></select></label>
      </div>
      {categories.length > 0 && <>
        <label className="lab-mobile-category lab-sort"><span>{t('Danh mục', 'Category')}</span><select value={category} onChange={(e) => { setCategory(e.target.value); setLimit(9); }}>{['all', ...categories].map((item) => <option key={item} value={item}>{item === 'all' ? t('Tất cả', 'All') : item}</option>)}</select></label>
        <CategoryFilters categories={categories} counts={counts} value={category} onChange={(value) => { setCategory(value); setLimit(9); }} label={t('Danh mục bài viết', 'Article categories')} />
      </>}
    </div>
    <ContentError resource="posts" />
    {loading && !posts.length ? <p className="lab-empty" role="status">{t('Đang tải bài viết…', 'Loading articles…')}</p>
      : filtered.length ? <ArticleList posts={filtered.slice(0, limit)} headingLevel={2} />
      : !failed && <div className="lab-empty" role="status"><p>{published.length ? t('Không tìm thấy bài viết phù hợp.', 'No matching articles.') : t('Chưa có bài viết được xuất bản.', 'No published articles yet.')}</p>{(query || category !== 'all') && <button type="button" className="lab-text-link" onClick={() => { setQuery(''); setCategory('all'); }}>{t('Xóa bộ lọc', 'Clear filters')}</button>}</div>}
    {!!published.length && <div className="lab-list-footer"><p role="status">{filtered.length} {t('bài viết', 'articles')}</p>{filtered.length > limit && <button className="lab-button" type="button" onClick={() => setLimit(limit + 9)}>{t('Xem thêm bài viết', 'Load more articles')}</button>}</div>}
  </>;
}
