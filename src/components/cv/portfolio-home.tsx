'use client';

import { DOMAINS } from '@/lib/cv/domains';
import { galleryMotion } from '@/lib/cv/motion';
import { externalUrl,normalizeSearch } from '@/lib/cv/presentation';
import { projectCategoryGroups } from '@/lib/cv/project-categories';
import { normalizeProjectUrl } from '@/lib/cv/project-input';
import { AnimatePresence,motion,useReducedMotion } from 'framer-motion';
import { AppWindow,ArrowRight,Bot,BrainCircuit,CircuitBoard,Cpu,Github,Radio,Search,X,type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useMemo,useState } from 'react';
import { CategoryFilters } from './category-filters';
import { ContentError,PreviewNotice } from './content-state';
import { Footer } from './footer';
import { GithubRepositories } from './github-repositories';
import { useLocale } from './locale-context';
import { Navbar } from './navbar';
import { ArticleList } from './notes-library';
import { ProjectCard } from './project-card';
import { SectionHeading } from './section-heading';
import { SignalArt } from './signal-art';
import { useSiteData } from './site-data-context';

const PAGE_SIZE = 9;
const DOMAIN_ICONS: Record<string, LucideIcon> = { Embedded: Cpu, Hardware: CircuitBoard, IoT: Radio, AI: BrainCircuit, Robotics: Bot, Software: AppWindow };

export function PortfolioHome() {
  const { projects, posts, settings, profile, loading, errors, requestFailed } = useSiteData();
  const { t, locale } = useLocale();
  const reduced = useReducedMotion();
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE_SIZE);
  const published = useMemo(() => projects.filter((project) => project.published !== false), [projects]);
  const flagged = useMemo(() => published.filter((project) => project.featured).slice(0, 3), [published]);
  const featured = flagged.length ? flagged : published.slice(0, 3);
  const groupsById = useMemo(() => new Map(published.map((project) => [project.id, projectCategoryGroups(project.category)])), [published]);
  const categories = useMemo(() => Array.from(new Set(published.flatMap((project) => groupsById.get(project.id) || []))), [published, groupsById]);
  const counts = useMemo(() => Object.fromEntries([['all', published.length], ...categories.map((item) => [item, published.filter((project) => groupsById.get(project.id)?.includes(item)).length])]), [published, categories, groupsById]);
  const filtered = useMemo(() => published.filter((project) => (category === 'all' || groupsById.get(project.id)?.includes(category))
    && normalizeSearch([project.title, project.category, project.subtitle, project.description, ...(project.tech || [])].join(' ')).includes(normalizeSearch(query))), [published, category, query, groupsById]);
  const domains = useMemo(() => DOMAINS.map((domain) => {
    const members = published.filter((project) => groupsById.get(project.id)?.includes(domain.key));
    const tally = new Map<string, number>();
    members.forEach((project) => (project.tech || []).forEach((tech) => tally.set(tech, (tally.get(tech) || 0) + 1)));
    const tech = [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([name]) => name);
    return { ...domain, count: members.length, tech };
  }).filter((domain) => domain.count > 0), [published, groupsById]);
  const latest = useMemo(() => posts.filter((post) => post.published).slice().sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 3), [posts]);
  const postCount = posts.filter((post) => post.published).length;
  const projectError = Boolean(errors?.projects || requestFailed);
  const postError = Boolean(errors?.posts || requestFailed);
  const showFeatured = settings.sectionFeaturedEnabled !== false && featured.length > 0;
  const headline = String((locale === 'vi' ? settings.heroHeadlineVi : settings.heroHeadlineEn) || '').split('\n').filter(Boolean);
  const introLink = normalizeProjectUrl(settings.heroPrimaryUrl, { allowRelative: true }) || '#projects';
  const githubLink = normalizeProjectUrl(settings.heroSecondaryUrl, { allowRelative: true }) || externalUrl(profile.github);
  const secondaryLabel = (locale === 'vi' ? settings.heroSecondaryLabelVi : settings.heroSecondaryLabelEn) || t('Mã nguồn trên GitHub', 'GitHub source code');
  const sourceCount = published.filter((project) => project.repo).length;
  const chooseCategory = (value: string) => { setCategory(value); setLimit(PAGE_SIZE); };
  const openDomain = (key: string) => {
    chooseCategory(key); setQuery('');
    document.getElementById('projects')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  };
  let section = 0;
  const nextIndex = () => String(++section).padStart(2, '0');

  return <div className="lab-site" id="top">
    <Navbar />
    <main id="main-content" tabIndex={-1}>
      <PreviewNotice />
      <section className="ui-hero" aria-labelledby="site-title">
        <div className="ui-hero-backdrop" aria-hidden="true" />
        <div className="lab-container ui-hero-grid">
          <div className="ui-hero-copy">
            <p className="ui-pill"><span className="ui-pulse" aria-hidden="true" />Engineering Lab · {t('Không gian thử nghiệm', 'An engineering collection')}</p>
            <h1 id="site-title">{headline.map((line, index) => <span key={index} className={index === headline.length - 1 && headline.length > 1 ? 'ui-gradient-text' : undefined}>{line}</span>)}</h1>
            <p className="ui-hero-lead">{locale === 'vi' ? settings.heroDescriptionVi : settings.heroDescriptionEn}</p>
            <div className="ui-hero-actions">
              <a className="lab-button lab-button-primary" href={introLink}>{(locale === 'vi' ? settings.heroPrimaryLabelVi : settings.heroPrimaryLabelEn) || t('Khám phá dự án', 'Explore projects')}<ArrowRight size={17} aria-hidden="true" /></a>
              {githubLink && <a className="lab-button" href={githubLink} {...(githubLink.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}><Github size={17} aria-hidden="true" />{secondaryLabel}</a>}
              <Link className="lab-text-link" href="/notes">Engineering Notes<ArrowRight size={15} aria-hidden="true" /></Link>
            </div>
          </div>
          <div className="ui-hero-panel">
            <div className="ui-panel-bar" aria-hidden="true"><span className="ui-panel-dots"><i /><i /><i /></span><span>signal-field.live</span><span>CH1 · CH2</span></div>
            <SignalArt label={t('Đồ họa tín hiệu tương tác', 'Interactive signal graphic')} />
            <dl className="ui-metrics">
              <div><dt>{t('Dự án', 'Projects')}</dt><dd><a href="#projects">{String(published.length).padStart(2, '0')}</a></dd></div>
              <div><dt>{t('Có mã nguồn', 'With source')}</dt><dd><a href="#github">{String(sourceCount).padStart(2, '0')}</a></dd></div>
              <div><dt>{t('Lĩnh vực', 'Domains')}</dt><dd><a href="#domains">{String(domains.length).padStart(2, '0')}</a></dd></div>
              <div><dt>{t('Bài viết', 'Articles')}</dt><dd><Link href="/notes">{String(postCount).padStart(2, '0')}</Link></dd></div>
            </dl>
          </div>
        </div>
      </section>

      {domains.length > 0 && <section className="lab-container ui-section" id="domains" aria-labelledby="domains-title">
        <SectionHeading id="domains-title" index={nextIndex()} kicker={t('Lĩnh vực', 'Domains')} title={t('Các lĩnh vực nghiên cứu', 'Areas of work')} caption={t('Dự án được phân loại theo lĩnh vực kỹ thuật. Chọn một lĩnh vực để lọc thư viện dự án.', 'Projects are grouped by engineering discipline. Choose one to filter the project index.')} />
        <div className="ui-domain-grid">
          {domains.map((domain) => {
            const Icon = DOMAIN_ICONS[domain.key] || Cpu;
            return <button type="button" key={domain.key} className="ui-domain-card" data-tone={domain.tone} onClick={() => openDomain(domain.key)} aria-label={t('Lọc dự án: ', 'Filter projects: ') + (locale === 'vi' ? domain.vi : domain.en)}>
              <span className="ui-domain-top"><span className="ui-domain-icon"><Icon size={20} aria-hidden="true" /></span><span className="ui-domain-count"><strong>{String(domain.count).padStart(2, '0')}</strong>{t('dự án', 'projects')}</span></span>
              <span className="ui-domain-name">{locale === 'vi' ? domain.vi : domain.en}</span>
              <span className="ui-domain-desc">{locale === 'vi' ? domain.descriptionVi : domain.descriptionEn}</span>
              {domain.tech.length > 0 && <span className="ui-domain-tech">{domain.tech.join(' · ')}</span>}
            </button>;
          })}
        </div>
      </section>}

      {showFeatured && <section className="lab-container ui-section" id="featured" aria-labelledby="featured-title">
        <SectionHeading id="featured-title" index={nextIndex()} kicker={flagged.length ? t('Tiêu biểu', 'Featured') : t('Bộ sưu tập', 'Collection')} title={flagged.length ? t('Dự án tiêu biểu', 'Featured projects') : t('Trong phòng lab', 'Inside the lab')} caption={t('Những hệ thống, nguyên mẫu và ý tưởng đã được triển khai.', 'Systems, prototypes and ideas brought into practice.')} />
        <div className="ui-featured-grid">{featured.map((project, index) => <ProjectCard key={project.id} project={project} feature={index === 0} priority={index === 0} />)}</div>
      </section>}

      <section className="lab-container ui-section" id="projects" aria-labelledby="projects-title">
        <SectionHeading id="projects-title" index={nextIndex()} kicker={t('Thư viện', 'Index')} title={t('Tất cả dự án', 'All projects')} caption={t('Tìm theo tên, công nghệ hoặc lọc theo lĩnh vực.', 'Search by name or technology, or filter by domain.')} />
        <div className="ui-toolbar">
          <div className="ui-toolbar-row">
            <div className="lab-search"><Search size={17} aria-hidden="true" /><label className="sr-only" htmlFor="project-search">{t('Tìm dự án', 'Search projects')}</label><input id="project-search" type="search" value={query} onChange={(e) => { setQuery(e.target.value); setLimit(PAGE_SIZE); }} placeholder={t('Tìm tên dự án hoặc công nghệ…', 'Search projects or technologies…')} />{query && <button type="button" onClick={() => { setQuery(''); setLimit(PAGE_SIZE); }} aria-label={t('Xóa tìm kiếm', 'Clear search')}><X size={16} /></button>}</div>
            <p className="ui-result-count" role="status">{filtered.length} / {published.length} {t('dự án', 'projects')}</p>
          </div>
          <label className="lab-mobile-category lab-sort"><span>{t('Lĩnh vực', 'Domain')}</span><select value={category} onChange={(e) => chooseCategory(e.target.value)}>{['all', ...categories].map((item) => <option key={item} value={item}>{item === 'all' ? t('Tất cả', 'All') : item} ({counts[item] ?? 0})</option>)}</select></label>
          <CategoryFilters categories={categories} counts={counts} value={category} onChange={chooseCategory} label={t('Lĩnh vực dự án', 'Project domains')} />
        </div>
        <ContentError resource="projects" />
        {loading && !published.length ? <p className="lab-empty" role="status">{t('Đang tải dự án…', 'Loading projects…')}</p>
          : filtered.length ? <div className="ui-project-grid" aria-busy={loading}><AnimatePresence initial={false}>{filtered.slice(0, limit).map((project) =>
            <motion.div key={project.id} layout={reduced ? false : 'position'} initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: reduced ? 0 : galleryMotion.fast } }} transition={galleryMotion.spring} className="ui-grid-item">
              <ProjectCard project={project} />
            </motion.div>)}</AnimatePresence></div>
          : !projectError && <div className="lab-empty" role="status"><p>{published.length ? t('Không tìm thấy dự án phù hợp.', 'No matching projects.') : t('Chưa có dự án được xuất bản.', 'No published projects yet.')}</p>{(query || category !== 'all') && <button className="lab-text-link" type="button" onClick={() => { setQuery(''); chooseCategory('all'); }}>{t('Xóa bộ lọc', 'Clear filters')}</button>}</div>}
        {filtered.length > limit && <div className="ui-load-more"><button type="button" className="lab-button" onClick={() => setLimit(limit + PAGE_SIZE)}>{t('Xem thêm dự án', 'Load more projects')} ({filtered.length - limit})</button></div>}
      </section>

      <GithubRepositories projects={published} profile={profile.github} index={nextIndex()} />

      <section className="lab-container ui-section" id="notes" aria-labelledby="notes-title">
        <SectionHeading id="notes-title" index={nextIndex()} kicker="Engineering Notes" title={t('Ghi chép kỹ thuật', 'Field notes')} caption={t('Hướng dẫn triển khai và kết quả thử nghiệm từ các dự án.', 'Implementation guides and experiment results.')}
          action={<Link href="/notes" className="lab-button">{t('Tất cả bài viết', 'All articles')}<ArrowRight size={16} aria-hidden="true" /></Link>} />
        <ContentError resource="posts" />
        {latest.length ? <ArticleList posts={latest} /> : !postError && <p className="lab-empty" role="status">{loading ? t('Đang tải bài viết…', 'Loading articles…') : t('Chưa có bài viết được xuất bản.', 'No published articles yet.')}</p>}
      </section>
    </main>
    <Footer />
  </div>;
}
