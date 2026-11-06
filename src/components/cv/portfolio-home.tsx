'use client';

import { normalizeSearch } from '@/lib/cv/presentation';
import { normalizeProjectUrl } from '@/lib/cv/project-input';
import { projectCategoryGroups } from '@/lib/cv/project-categories';
import type { SiteProject } from '@/lib/cv/site-data-server';
import { ArrowRight,ArrowUpRight,Search,X } from 'lucide-react';
import Link from 'next/link';
import { useMemo,useState } from 'react';
import { ContentImage } from './content-image';
import { SignalArt } from './signal-art';
import { CategoryFilters } from './category-filters';
import { ProjectSummary } from './project-summary';
import { ProjectExhibition } from './project-exhibition';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { galleryMotion } from '@/lib/cv/motion';
import { Reveal } from './reveal';
import { ContentError,PreviewNotice } from './content-state';
import { Footer } from './footer';
import { useLocale } from './locale-context';
import { Navbar } from './navbar';
import { ArticleList } from './notes-library';
import { useSiteData } from './site-data-context';

function ProjectRow({ project, priority = false }: { project: SiteProject; priority?: boolean }) {
  const reduced = useReducedMotion();
  return <motion.article layout={reduced ? false : "position"} initial={reduced ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: reduced ? 0 : galleryMotion.fast } }} transition={galleryMotion.spring} className="lab-project-row"><Link href={'/projects/' + encodeURIComponent(project.id)}>
    <div className="lab-project-image"><ContentImage src={project.image} alt="" sizes="(max-width: 760px) calc(100vw - 36px), (max-width: 1440px) 46vw, 640px" priority={priority} /></div>
    <ProjectSummary project={project} /><ArrowUpRight className="lab-row-arrow" size={18} aria-hidden="true" />
  </Link></motion.article>;
}

export function PortfolioHome() {
  const { projects, posts, settings, loading, errors, requestFailed } = useSiteData();
  const { t, locale } = useLocale();
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(6);
  const published = useMemo(() => projects.filter((project) => project.published !== false), [projects]);
  const featured = useMemo(() => published.filter((project) => project.featured).slice(0, 3), [published]);
  const categories = useMemo(() => Array.from(new Set(published.flatMap((project) => projectCategoryGroups(project.category)))), [published]);
  const filtered = useMemo(() => published.filter((project) => (category === 'all' || projectCategoryGroups(project.category).includes(category))
    && normalizeSearch([project.title, project.category, project.subtitle, project.description, ...(project.tech || [])].join(' ')).includes(normalizeSearch(query))), [published, category, query]);
  const latest = useMemo(() => posts.filter((post) => post.published).slice().sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 3), [posts]);
  const projectError = Boolean(errors?.projects || requestFailed);
  const postError = Boolean(errors?.posts || requestFailed);
  const exhibition = useMemo(() => featured.length ? featured : published.slice(0, 3), [featured, published]);
  const showFeatured = settings.sectionFeaturedEnabled !== false && exhibition.length > 0;
  const headline = String((locale === 'vi' ? settings.heroHeadlineVi : settings.heroHeadlineEn) || '').split('\n');
  const introLink = normalizeProjectUrl(settings.heroPrimaryUrl, { allowRelative: true }) || "#projects";

  return <div className="lab-site" id="top">
    <Navbar />
    <main id="main-content" tabIndex={-1}>
      <PreviewNotice />
      <section className="lab-hero lab-container" aria-labelledby="site-title">
        <div className="lab-hero-copy">
          <p className="lab-eyebrow"><span className="lab-signal-dot" />Engineering Lab <span>/</span> {t('Không gian thử nghiệm', 'An engineering collection')}</p>
          <h1 id="site-title">{headline.map((line, index) => <span key={index}>{line}</span>)}</h1>
          <p className="lab-hero-description">{locale === 'vi' ? settings.heroDescriptionVi : settings.heroDescriptionEn}</p>
          <div className="lab-hero-actions"><a className="lab-button lab-button-primary" href={introLink}>{(locale === 'vi' ? settings.heroPrimaryLabelVi : settings.heroPrimaryLabelEn) || t('Khám phá dự án', 'Explore projects')}<ArrowUpRight size={19} aria-hidden="true" /></a><Link className="lab-text-link" href="/notes">Engineering Notes <ArrowRight size={16} aria-hidden="true" /></Link></div>
          </div>
        <SignalArt label={t("Signal field · Đồ họa tương tác", "Signal field · Interactive graphic")}><div className="lab-hero-index"><a href="#projects"><strong>{String(published.length).padStart(2, '0')}</strong>{t('Dự án', 'Projects')}</a><Link href="/notes"><strong>{String(latest.length ? posts.filter((post) => post.published).length : 0).padStart(2, '0')}</strong>{t('Bài viết', 'Articles')}</Link><span>HARDWARE ↔ SOFTWARE</span></div>
          </SignalArt>
      </section>

      {showFeatured && <section className="lab-section lab-container lab-exhibition" aria-labelledby="featured-title">
        <Reveal><div className="lab-section-heading"><div><p className="lab-eyebrow">01 / {t('Không gian trưng bày', 'In the collection')}</p><h2 id="featured-title">{featured.length ? t('Dự án nổi bật.', 'Selected work.') : t('Trong phòng lab.', 'Inside the lab.')}</h2></div><p className="lab-section-caption">{t('Những hệ thống, nguyên mẫu và ý tưởng đã được triển khai.', 'Systems, prototypes and ideas brought into practice.')}</p></div></Reveal>
        <ProjectExhibition projects={exhibition} />
      </section>}

      <section className="lab-section lab-container" id="projects" aria-labelledby="projects-title">
        <Reveal><div className="lab-section-heading"><div><p className="lab-eyebrow">02 / {t('Khám phá dự án', 'Project explorer')}</p><h2 id="projects-title">{t('Thư viện dự án.', 'Project index.')}</h2></div><p className="lab-section-caption">{t('Khám phá theo lĩnh vực hoặc tìm công nghệ bạn quan tâm.', 'Browse by discipline or find the technology you’re interested in.')}</p></div></Reveal>
        <div className="lab-library-controls">
          <div className="lab-search"><Search size={17} aria-hidden="true" /><label className="sr-only" htmlFor="project-search">{t('Tìm dự án', 'Search projects')}</label><input id="project-search" type="search" value={query} onChange={(e) => { setQuery(e.target.value); setLimit(6); }} placeholder={t('Tìm tên hoặc công nghệ…', 'Search projects or technologies…')} />{query && <button type="button" onClick={() => { setQuery(''); setLimit(6); }} aria-label={t('Xóa tìm kiếm', 'Clear search')}><X size={16} /></button>}</div>
          <label className="lab-mobile-category lab-sort"><span>{t('Danh mục', 'Category')}</span><select value={category} onChange={(e) => { setCategory(e.target.value); setLimit(6); }}>{['all', ...categories].map((item) => <option key={item} value={item}>{item === 'all' ? t('Tất cả', 'All') : item}</option>)}</select></label>
          <CategoryFilters categories={categories} value={category} onChange={(value) => { setCategory(value); setLimit(6); }} label={t('Danh mục dự án', 'Project categories')} />
        </div>
        <ContentError resource="projects" />
        {loading && !published.length ? <p className="lab-empty" role="status">{t('Đang tải dự án…', 'Loading projects…')}</p>
          : filtered.length ? <div className="lab-project-list" aria-busy={loading}><AnimatePresence initial={false}>{filtered.slice(0, limit).map((project, index) => <ProjectRow key={project.id} project={project} priority={!showFeatured && index === 0} />)}</AnimatePresence></div>
          : !projectError && <div className="lab-empty" role="status"><p>{published.length ? t('Không tìm thấy dự án phù hợp.', 'No matching projects.') : t('Chưa có dự án được xuất bản.', 'No published projects yet.')}</p>{(query || category !== 'all') && <button className="lab-text-link" type="button" onClick={() => { setQuery(''); setCategory('all'); }}>{t('Xóa bộ lọc', 'Clear filters')}</button>}</div>}
        {published.length > 0 && <div className="lab-list-footer"><p role="status">{filtered.length} {t('dự án', 'projects')}</p>{filtered.length > limit && <button type="button" className="lab-button" onClick={() => setLimit(limit + 6)}>{t('Xem thêm dự án', 'Load more projects')}</button>}</div>}
      </section>

      <section className="lab-notes-island" id="notes" aria-labelledby="notes-title"><div className="lab-container lab-section">
        <div className="lab-section-heading"><div><p className="lab-eyebrow">03 / Engineering Notes</p><h2 id="notes-title">{t('Ghi chép kỹ thuật.', 'Field notes.')}</h2></div><Link href="/notes" className="lab-text-link">{t('Tất cả bài viết', 'All articles')}<ArrowRight size={15} aria-hidden="true" /></Link></div>
        <ContentError resource="posts" />
        {latest.length ? <ArticleList posts={latest} compact /> : !postError && <p className="lab-empty" role="status">{loading ? t('Đang tải bài viết…', 'Loading articles…') : t('Chưa có bài viết được xuất bản.', 'No published articles yet.')}</p>}
      </div></section>
    </main>
    <Footer />
  </div>;
}
