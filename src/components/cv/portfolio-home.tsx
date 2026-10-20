'use client';

import { normalizeSearch,plainText } from '@/lib/cv/presentation';
import { normalizeProjectUrl } from '@/lib/cv/project-input';
import type { SiteProject } from '@/lib/cv/site-data-server';
import { ArrowRight,ArrowUpRight,Search,X } from 'lucide-react';
import Link from 'next/link';
import { useMemo,useState } from 'react';
import { ContentImage } from './content-image';
import { ContentError,PreviewNotice } from './content-state';
import { Footer } from './footer';
import { useLocale } from './locale-context';
import { Navbar } from './navbar';
import { ArticleList } from './notes-library';
import { useSiteData } from './site-data-context';

function ProjectSummary({ project }: { project: SiteProject }) {
  const { locale } = useLocale();
  const statuses: Record<string, string> = locale === 'vi'
    ? { completed: 'Hoàn thành', 'in-development': 'Đang phát triển', prototype: 'Nguyên mẫu', research: 'Nghiên cứu' }
    : { completed: 'Completed', 'in-development': 'In development', prototype: 'Prototype', research: 'Research' };
  return <div className="lab-project-copy">
    <p className="lab-project-meta">{project.category}{project.status && statuses[project.status] && <span>{statuses[project.status]}</span>}</p>
    <h3>{project.title}</h3>
    <p className="lab-project-description">{plainText(project.subtitle || project.description).slice(0, 220)}</p>
    {!!project.tech?.length && <ul className="lab-tech-list" aria-label={locale === 'vi' ? 'Công nghệ' : 'Technologies'}>{project.tech.slice(0, 4).map((tech) => <li key={tech}>{tech}</li>)}</ul>}
  </div>;
}

function ProjectRow({ project, priority = false }: { project: SiteProject; priority?: boolean }) {
  return <article className="lab-project-row"><Link href={'/projects/' + encodeURIComponent(project.id)}>
    <div className="lab-project-image"><ContentImage src={project.image} alt={project.title} sizes="(max-width: 560px) 100vw, 240px" priority={priority} /></div>
    <ProjectSummary project={project} /><ArrowUpRight className="lab-row-arrow" size={18} aria-hidden="true" />
  </Link></article>;
}

export function PortfolioHome() {
  const { projects, posts, settings, loading, errors, requestFailed } = useSiteData();
  const { t, locale } = useLocale();
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(6);
  const published = useMemo(() => projects.filter((project) => project.published !== false), [projects]);
  const featured = useMemo(() => published.filter((project) => project.featured).slice(0, 3), [published]);
  const categories = useMemo(() => Array.from(new Set(published.map((project) => project.category).filter(Boolean))), [published]);
  const filtered = useMemo(() => published.filter((project) => (category === 'all' || project.category === category)
    && normalizeSearch([project.title, project.category, project.subtitle, project.description, ...(project.tech || [])].join(' ')).includes(normalizeSearch(query))), [published, category, query]);
  const latest = useMemo(() => posts.filter((post) => post.published).slice().sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 3), [posts]);
  const projectError = Boolean(errors?.projects || requestFailed);
  const postError = Boolean(errors?.posts || requestFailed);
  const showFeatured = settings.sectionFeaturedEnabled !== false && featured.length > 0;
  const introLink = normalizeProjectUrl(settings.heroPrimaryUrl, { allowRelative: true }) || "#projects";

  return <div className="lab-site" id="top">
    <Navbar />
    <main id="main-content">
      <PreviewNotice />
      <section className="lab-intro lab-container" aria-labelledby="site-title">
        <h1 id="site-title">{locale === 'vi' ? settings.heroHeadlineVi : settings.heroHeadlineEn}</h1>
        <p>{locale === 'vi' ? settings.heroDescriptionVi : settings.heroDescriptionEn}</p>
        <a className="lab-text-link" href={introLink}>{(locale === "vi" ? settings.heroPrimaryLabelVi : settings.heroPrimaryLabelEn) || t('Xem dự án', 'Browse projects')}<ArrowRight size={15} aria-hidden="true" /></a>
      </section>

      {showFeatured && <section className="lab-section lab-container" aria-labelledby="featured-title">
        <div className="lab-section-heading"><h2 id="featured-title">{t('Dự án nổi bật', 'Featured projects')}</h2></div>
        <div className="lab-featured-layout">
          <article className="lab-featured-lead"><Link href={'/projects/' + encodeURIComponent(featured[0].id)}>
            <div className="lab-featured-image"><ContentImage src={featured[0].image} alt={featured[0].title} sizes="(max-width: 760px) 100vw, 680px" priority /></div>
            <ProjectSummary project={featured[0]} />
          </Link></article>
          {featured.length > 1 && <div className="lab-featured-more">{featured.slice(1).map((project) => <ProjectRow key={project.id} project={project} />)}</div>}
        </div>
      </section>}

      <section className="lab-section lab-container" id="projects" aria-labelledby="projects-title">
        <div className="lab-section-heading"><h2 id="projects-title">{t('Dự án', 'Projects')}</h2></div>
        <div className="lab-library-controls">
          <div className="lab-search"><Search size={17} aria-hidden="true" /><label className="sr-only" htmlFor="project-search">{t('Tìm dự án', 'Search projects')}</label><input id="project-search" type="search" value={query} onChange={(e) => { setQuery(e.target.value); setLimit(6); }} placeholder={t('Tìm tên hoặc công nghệ…', 'Search projects or technologies…')} />{query && <button type="button" onClick={() => { setQuery(''); setLimit(6); }} aria-label={t('Xóa tìm kiếm', 'Clear search')}><X size={16} /></button>}</div>
          <label className="lab-mobile-category lab-sort"><span>{t('Danh mục', 'Category')}</span><select value={category} onChange={(e) => { setCategory(e.target.value); setLimit(6); }}>{['all', ...categories].map((item) => <option key={item} value={item}>{item === 'all' ? t('Tất cả', 'All') : item}</option>)}</select></label>
          <div className="lab-filters" role="group" aria-label={t('Danh mục dự án', 'Project categories')}>
            {['all', ...categories].map((item) => <button type="button" key={item} aria-pressed={category === item} onClick={() => { setCategory(item); setLimit(6); }}>{item === 'all' ? t('Tất cả', 'All') : item}</button>)}
          </div>
        </div>
        <ContentError resource="projects" />
        {loading && !published.length ? <p className="lab-empty" role="status">{t('Đang tải dự án…', 'Loading projects…')}</p>
          : filtered.length ? <div className="lab-project-list" aria-busy={loading}>{filtered.slice(0, limit).map((project, index) => <ProjectRow key={project.id} project={project} priority={!showFeatured && index === 0} />)}</div>
          : !projectError && <div className="lab-empty" role="status"><p>{published.length ? t('Không tìm thấy dự án phù hợp.', 'No matching projects.') : t('Chưa có dự án được xuất bản.', 'No published projects yet.')}</p>{(query || category !== 'all') && <button className="lab-text-link" type="button" onClick={() => { setQuery(''); setCategory('all'); }}>{t('Xóa bộ lọc', 'Clear filters')}</button>}</div>}
        {published.length > 0 && <div className="lab-list-footer"><p role="status">{filtered.length} {t('dự án', 'projects')}</p>{filtered.length > limit && <button type="button" className="lab-button" onClick={() => setLimit(limit + 6)}>{t('Xem thêm dự án', 'Load more projects')}</button>}</div>}
      </section>

      <section className="lab-section lab-container" id="notes" aria-labelledby="notes-title">
        <div className="lab-section-heading"><h2 id="notes-title">{t('Bài viết mới nhất', 'Latest articles')}</h2><Link href="/notes" className="lab-text-link">{t('Tất cả bài viết', 'All articles')}<ArrowRight size={15} aria-hidden="true" /></Link></div>
        <ContentError resource="posts" />
        {latest.length ? <ArticleList posts={latest} compact /> : !postError && <p className="lab-empty" role="status">{loading ? t('Đang tải bài viết…', 'Loading articles…') : t('Chưa có bài viết được xuất bản.', 'No published articles yet.')}</p>}
      </section>
    </main>
    <Footer />
  </div>;
}
