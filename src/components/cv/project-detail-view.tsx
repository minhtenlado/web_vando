'use client';

import { Dialog,DialogContent,DialogDescription,DialogTitle } from '@/components/ui/dialog';
import { domainFor,STATUS_LABELS } from '@/lib/cv/domains';
import { projectCategoryGroups } from '@/lib/cv/project-categories';
import { normalizeProjectImage,normalizeProjectUrl } from '@/lib/cv/project-input';
import type { SiteProject } from '@/lib/cv/site-data-server';
import { ArrowLeft,ArrowRight,ArrowUpRight,ChartColumn,Check,ChevronLeft,ChevronRight,Code,Cpu,Expand,ExternalLink,Github,Layers,ShieldCheck,Sparkles,Terminal,Wifi,Wrench,Zap,type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useMemo,useRef,useState,type ReactNode } from 'react';
import { ContentImage } from './content-image';
import './detail-polish.css';
import { useLocale } from './locale-context';
import { DomainChips,ProjectCard,StatusBadge } from './project-card';
import { ProjectVideo } from './project-video';

const ICONS: Record<string, LucideIcon> = { cpu: Cpu, layers: Layers, zap: Zap, code: Code, wifi: Wifi, shieldcheck: ShieldCheck, wrench: Wrench, sparkles: Sparkles, terminal: Terminal, chart: ChartColumn };

export function ProjectDetailView({ project, relatedProjects, adjacent, children }: {
  project: SiteProject; relatedProjects: SiteProject[]; adjacent?: { previous?: SiteProject; next?: SiteProject }; children?: ReactNode;
}) {
  const { t, locale } = useLocale();
  const [imageIndex, setImageIndex] = useState<number | null>(null);
  const imageOpener = useRef<HTMLButtonElement | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const images = useMemo(() => Array.from(new Set([project.image, ...(project.images || [])].map(normalizeProjectImage).filter(Boolean))), [project.image, project.images]);
  const repo = normalizeProjectUrl(project.repo, { allowRelative: true });
  const resource = normalizeProjectUrl(project.link, { allowRelative: true });
  const video = normalizeProjectUrl(project.youtubeUrl, { youtubeOnly: true });
  const videoId = video?.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/)?.[1];
  const showVideo = Boolean(videoId && project.showVideoDemo !== false);
  const status = STATUS_LABELS[project.status || ''];
  const features = (project.features || []).filter(Boolean);
  const responsibilities = (project.responsibilities || []).filter((item) => item.title || item.subtitle);
  const results = (project.results || []).filter((item) => item.number || item.label);
  const domains = projectCategoryGroups(project.category).map((key) => domainFor(key)).filter((domain): domain is NonNullable<typeof domain> => Boolean(domain));
  const repoOnGithub = Boolean(repo && /github\.com/i.test(repo));
  const hasOverview = Boolean(children || project.overviewQuote);

  const sections = [
    ...(hasOverview ? [{ id: 'overview', title: t('Tổng quan', 'Overview') }] : []),
    ...(features.length ? [{ id: 'features', title: t('Tính năng', 'Features') }] : []),
    ...(responsibilities.length ? [{ id: 'implementation', title: t('Triển khai', 'Implementation') }] : []),
    ...(images.length > 1 ? [{ id: 'gallery', title: project.visualsTitle || t('Hình ảnh', 'Gallery') }] : []),
    ...(showVideo ? [{ id: 'video', title: project.videoTitle || t('Video trình diễn', 'Demo video') }] : []),
    ...(results.length ? [{ id: 'results', title: t('Kết quả', 'Results') }] : []),
  ];
  const number = (id: string) => String(sections.findIndex((section) => section.id === id) + 1).padStart(2, '0');
  const open = (index: number, opener: HTMLButtonElement) => { imageOpener.current = opener; setImageIndex(index); };
  const links = <>
    {repo && <a className="lab-button lab-button-primary" href={repo} target="_blank" rel="noopener noreferrer">{repoOnGithub ? <Github size={17} aria-hidden="true" /> : null}{repoOnGithub ? t('Mã nguồn trên GitHub', 'Source on GitHub') : t('Mã nguồn', 'Source code')}<ArrowUpRight size={15} aria-hidden="true" /></a>}
    {resource && resource !== repo && <a className="lab-button" href={resource} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} aria-hidden="true" />{/youtu\.?be/i.test(resource) ? t('Xem video', 'Watch video') : t('Tài nguyên dự án', 'Project resource')}</a>}
  </>;

  return <main id="main-content" tabIndex={-1} className="ui-detail">
    <div className="lab-container">
      <nav className="ui-breadcrumb" aria-label="Breadcrumb"><Link href="/">{t('Trang chủ', 'Home')}</Link><ChevronRight size={14} aria-hidden="true" /><Link href="/#projects">{t('Dự án', 'Projects')}</Link><ChevronRight size={14} aria-hidden="true" /><span aria-current="page">{project.title}</span></nav>

      <header className="ui-detail-header">
        <div className="ui-detail-kicker"><DomainChips category={project.category} /><StatusBadge status={project.status} />{project.year && <span className="ui-detail-year">{project.year}</span>}</div>
        <h1>{project.title}</h1>
        {project.subtitle && <p className="ui-detail-lead">{project.subtitle}</p>}
        {(repo || resource) && <div className="ui-detail-actions">{links}</div>}
      </header>

      {images.length > 0 && <button type="button" className="ui-detail-cover" onClick={(event) => open(0, event.currentTarget)} aria-label={t('Xem ảnh dự án lớn', 'Enlarge project image')}>
        <ContentImage src={images[0]} alt={project.title} sizes="(max-width: 1240px) 100vw, 1200px" priority fit="contain" />
        <span className="ui-cover-hint"><Expand size={14} aria-hidden="true" />{images.length > 1 ? `1 / ${images.length}` : t('Phóng to', 'Enlarge')}</span>
      </button>}

      <div className="ui-detail-layout">
        <div className="ui-detail-main">
          {hasOverview && <section id="overview" className="ui-detail-section">
            <h2><span>{number('overview')}</span>{t('Tổng quan', 'Overview')}</h2>
            {project.overviewQuote && <blockquote className="ui-quote">{project.overviewQuote}</blockquote>}
            {children && <div className="lab-prose ql-editor-display">{children}</div>}
          </section>}

          {features.length > 0 && <section id="features" className="ui-detail-section">
            <h2><span>{number('features')}</span>{t('Tính năng', 'Features')}</h2>
            <ul className="ui-check-list">{features.map((feature, index) => <li key={index}><Check size={16} aria-hidden="true" />{feature}</li>)}</ul>
          </section>}

          {responsibilities.length > 0 && <section id="implementation" className="ui-detail-section">
            <h2><span>{number('implementation')}</span>{t('Triển khai', 'Implementation')}</h2>
            <div className="ui-impl-grid">{responsibilities.map((item, index) => {
              const Icon = ICONS[item.icon] || Cpu;
              return <div className="ui-impl-card" key={index}><span className="ui-impl-icon"><Icon size={18} aria-hidden="true" /></span>{item.title && <h3>{item.title}</h3>}{item.subtitle && <p>{item.subtitle}</p>}</div>;
            })}</div>
          </section>}

          {images.length > 1 && <section id="gallery" className="ui-detail-section">
            <h2><span>{number('gallery')}</span>{project.visualsTitle || t('Hình ảnh', 'Gallery')}</h2>
            <div className="lab-gallery">{images.slice(1).map((src, index) => <button type="button" key={src} onClick={(event) => open(index + 1, event.currentTarget)} aria-label={t('Xem ảnh ', 'View image ') + (index + 2)}><ContentImage src={src} alt={project.title + ' — ' + (index + 2)} sizes="(max-width: 640px) 100vw, 400px" fit="contain" /></button>)}</div>
          </section>}

          {showVideo && videoId && <section id="video" className="ui-detail-section">
            <h2><span>{number('video')}</span>{project.videoTitle || t('Video trình diễn', 'Demo video')}</h2>
            <ProjectVideo key={videoId} videoId={videoId} title={project.videoTitle || project.title} suspended={imageIndex !== null} />
          </section>}

          {results.length > 0 && <section id="results" className="ui-detail-section">
            <h2><span>{number('results')}</span>{t('Kết quả', 'Results')}</h2>
            <dl className="ui-result-grid">{results.map((item, index) => <div key={index}>{item.number && <dt>{item.number}</dt>}{item.label && <dd>{item.label}</dd>}</div>)}</dl>
          </section>}
        </div>

        <aside className="ui-detail-aside" aria-label={t('Thông số dự án', 'Project facts')}>
          <div className="ui-spec-card">
            <h2>{t('Thông số dự án', 'Project facts')}</h2>
            <dl className="ui-spec-list">
              {status && <div><dt>{t('Trạng thái', 'Status')}</dt><dd><StatusBadge status={project.status} /></dd></div>}
              {project.year && <div><dt>{t('Thời gian', 'Date')}</dt><dd>{project.year}</dd></div>}
              {project.role && <div><dt>{t('Vai trò', 'Role')}</dt><dd>{project.role}</dd></div>}
              {project.projectType && <div><dt>{t('Loại dự án', 'Type')}</dt><dd>{project.projectType}</dd></div>}
              {domains.length > 0 && <div><dt>{t('Lĩnh vực', 'Domains')}</dt><dd>{domains.map((domain) => locale === 'vi' ? domain.vi : domain.en).join(', ')}</dd></div>}
              {project.highlight && <div><dt>{t('Điểm nhấn', 'Highlights')}</dt><dd>{project.highlight}</dd></div>}
            </dl>
            {!!project.tech?.length && <><h3>{t('Công nghệ', 'Technology')}</h3><ul className="ui-tags">{project.tech.map((tech) => <li key={tech}>{tech}</li>)}</ul></>}
            {(repo || resource) && <div className="ui-spec-links">{links}</div>}
          </div>
          {sections.length > 1 && <nav className="ui-toc-card" aria-label={t('Nội dung dự án', 'Project sections')}>
            <h2>{t('Nội dung', 'Contents')}</h2>
            <ol>{sections.map((section, index) => <li key={section.id}><a href={'#' + section.id}><span>{String(index + 1).padStart(2, '0')}</span>{section.title}</a></li>)}</ol>
          </nav>}
        </aside>
      </div>

      {(adjacent?.previous || adjacent?.next) && <nav className="lab-project-pager" aria-label={t('Dự án khác', 'More projects')}>
        {adjacent.previous ? <Link href={'/projects/' + encodeURIComponent(adjacent.previous.id)} rel="prev"><span><ArrowLeft size={15} aria-hidden="true" />{t('Dự án trước', 'Previous project')}</span><strong>{adjacent.previous.title}</strong></Link> : <span />}
        {adjacent.next ? <Link href={'/projects/' + encodeURIComponent(adjacent.next.id)} rel="next" data-next="true"><span>{t('Dự án tiếp theo', 'Next project')}<ArrowRight size={15} aria-hidden="true" /></span><strong>{adjacent.next.title}</strong></Link> : <span />}
      </nav>}

      {relatedProjects.length > 0 && <section className="ui-related" aria-labelledby="related-title">
        <h2 id="related-title">{t('Dự án liên quan', 'Related projects')}</h2>
        <div className="ui-project-grid">{relatedProjects.map((item) => <ProjectCard key={item.id} project={item} />)}</div>
      </section>}
    </div>

    <Dialog open={imageIndex !== null} onOpenChange={(isOpen) => { if (!isOpen) setImageIndex(null); }}>
      <DialogContent className="lab-lightbox" onCloseAutoFocus={(event) => { event.preventDefault(); imageOpener.current?.focus(); }} onKeyDown={(event) => { if (imageIndex === null) return; if (event.key === 'ArrowLeft') setImageIndex((imageIndex - 1 + images.length) % images.length); if (event.key === 'ArrowRight') setImageIndex((imageIndex + 1) % images.length); }}>
        <DialogTitle className="sr-only">{project.title}</DialogTitle><DialogDescription className="sr-only">{t('Ảnh dự án. Dùng phím trái và phải để chuyển ảnh.', 'Project images. Use left and right arrow keys to navigate.')}</DialogDescription>
        {imageIndex !== null && <><div className="lab-lightbox-image" onTouchStart={(event) => { touchStart.current = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null; }} onTouchEnd={(event) => { const start = touchStart.current; touchStart.current = null; if (!start || !event.changedTouches[0]) return; const dx = event.changedTouches[0].clientX - start.x; const dy = event.changedTouches[0].clientY - start.y; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3 && images.length > 1) setImageIndex((imageIndex + (dx < 0 ? 1 : -1) + images.length) % images.length); }}><ContentImage key={images[imageIndex]} src={images[imageIndex]} alt={project.title + ' — ' + (imageIndex + 1)} sizes="100vw" fit="contain" /></div><div className="lab-lightbox-controls"><button type="button" disabled={images.length < 2} onClick={() => setImageIndex((imageIndex - 1 + images.length) % images.length)} aria-label={t('Ảnh trước', 'Previous image')}><ChevronLeft /></button><span>{imageIndex + 1} / {images.length}</span><button type="button" disabled={images.length < 2} onClick={() => setImageIndex((imageIndex + 1) % images.length)} aria-label={t('Ảnh tiếp', 'Next image')}><ChevronRight /></button></div></>}
      </DialogContent>
    </Dialog>
  </main>;
}
