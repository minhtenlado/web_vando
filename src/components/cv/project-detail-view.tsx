'use client';

import { Dialog,DialogContent,DialogDescription,DialogTitle } from '@/components/ui/dialog';
import { normalizeProjectImage,normalizeProjectUrl } from '@/lib/cv/project-input';
import type { SiteProject } from '@/lib/cv/site-data-server';
import { ArrowLeft,ArrowUpRight,ChevronLeft,ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useMemo,useRef,useState,type ReactNode } from 'react';
import { ContentImage } from './content-image';
import './detail-polish.css';
import { useLocale } from './locale-context';

export function ProjectDetailView({ project, relatedProjects, children }: {
  project: SiteProject; relatedProjects: SiteProject[]; children?: ReactNode;
}) {
  const { t } = useLocale();
  const [imageIndex, setImageIndex] = useState<number | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const imageOpener = useRef<HTMLButtonElement | null>(null);
  const images = useMemo(() => Array.from(new Set([project.image, ...(project.images || [])].map(normalizeProjectImage).filter(Boolean))), [project.image, project.images]);
  const repo = normalizeProjectUrl(project.repo, { allowRelative: true });
  const resource = normalizeProjectUrl(project.link, { allowRelative: true });
  const video = normalizeProjectUrl(project.youtubeUrl, { youtubeOnly: true });
  const videoId = video?.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/)?.[1];
  const status = ({ completed: t('Hoàn thành', 'Completed'), 'in-development': t('Đang phát triển', 'In development'), prototype: t('Nguyên mẫu', 'Prototype'), research: t('Nghiên cứu', 'Research') } as Record<string, string>)[project.status || ''];
  const features = (project.features || []).filter(Boolean);
  const responsibilities = (project.responsibilities || []).filter((item) => item.title || item.subtitle);
  const results = (project.results || []).filter((item) => item.number || item.label);

  return <main id="main-content" className="lab-container lab-project-detail">
    <Link href="/#projects" className="lab-detail-back"><ArrowLeft size={15} aria-hidden="true" />{t('Tất cả dự án', 'All projects')}</Link>
    <header className="lab-project-header">
      <p className="lab-detail-meta">{project.category}{project.year && <span>{project.year}</span>}{status && <span>{status}</span>}</p>
      <h1>{project.title}</h1>
      {project.subtitle && <p className="lab-detail-lead">{project.subtitle}</p>}
      {project.tech?.length > 0 && <ul className="lab-tech-list" aria-label={t('Công nghệ', 'Technologies')}>{project.tech.map((tech) => <li key={tech}>{tech}</li>)}</ul>}
      {(repo || resource) && <div className="lab-resource-links">{repo && <a href={repo} target="_blank" rel="noopener noreferrer">{t('Mã nguồn', 'Source code')}<ArrowUpRight size={15} /></a>}{resource && <a href={resource} target="_blank" rel="noopener noreferrer">{t('Tài nguyên dự án', 'Project resource')}<ArrowUpRight size={15} /></a>}</div>}
    </header>

    {images.length > 0 && <button type="button" className="lab-project-cover" onClick={(event) => { imageOpener.current = event.currentTarget; setImageIndex(0); }} aria-label={t('Xem ảnh dự án lớn', 'Enlarge project image')}><ContentImage src={images[0]} alt={project.title} sizes="(max-width: 768px) 100vw, 1120px" priority fit="contain" /></button>}
    <div className="lab-project-document">
      {(children || project.overviewQuote || project.highlight || project.projectType) && <section>
        <h2>{t('Tổng quan', 'Overview')}</h2>
        {project.overviewQuote && <p className="lab-detail-lead">{project.overviewQuote}</p>}
        {project.projectType && <p className="lab-detail-meta">{project.projectType}</p>}
        {project.highlight && <p>{project.highlight}</p>}
        {children && <div className="lab-prose ql-editor-display">{children}</div>}
      </section>}
      {features.length > 0 && <section><h2>{t('Tính năng', 'Features')}</h2><ul className="lab-feature-list">{features.map((feature, index) => <li key={index}>{feature}</li>)}</ul></section>}
      {responsibilities.length > 0 && <section><h2>{t('Triển khai', 'Implementation')}</h2><dl className="lab-implementation-list">{responsibilities.map((item, index) => <div key={index}>{item.title && <dt>{item.title}</dt>}{item.subtitle && <dd>{item.subtitle}</dd>}</div>)}</dl></section>}
      {images.length > 1 && <section><h2>{project.visualsTitle || t('Hình ảnh', 'Gallery')}</h2><div className="lab-gallery">{images.slice(1).map((src, index) => <button type="button" key={src} onClick={(event) => { imageOpener.current = event.currentTarget; setImageIndex(index + 1); }} aria-label={t('Xem ảnh ', 'View image ') + (index + 2)}><ContentImage src={src} alt={project.title + ' — ' + (index + 2)} sizes="(max-width: 560px) 100vw, 540px" fit="contain" /></button>)}</div></section>}
      {videoId && project.showVideoDemo !== false && <section><h2>{project.videoTitle || t('Video trình diễn', 'Demo video')}</h2><div className="lab-video">{videoOpen ? <iframe loading="lazy" src={'https://www.youtube-nocookie.com/embed/' + videoId} title={project.videoTitle || project.title} allow="fullscreen; encrypted-media; picture-in-picture" allowFullScreen /> : <button type="button" className="lab-button" onClick={() => setVideoOpen(true)}>{t('Tải video YouTube', 'Load YouTube video')}</button>}</div></section>}
      {results.length > 0 && <section><h2>{t('Kết quả', 'Results')}</h2><dl className="lab-result-list">{results.map((item, index) => <div key={index}>{item.number && <dt>{item.number}</dt>}{item.label && <dd>{item.label}</dd>}</div>)}</dl></section>}
    </div>
    {relatedProjects.length > 0 && <section className="lab-related"><h2>{t('Dự án liên quan', 'Related projects')}</h2><ul>{relatedProjects.map((item) => <li key={item.id}><Link href={'/projects/' + encodeURIComponent(item.id)}>{item.title}<ArrowUpRight size={16} aria-hidden="true" /></Link></li>)}</ul></section>}
    <Dialog open={imageIndex !== null} onOpenChange={(open) => { if (!open) setImageIndex(null); }}>
      <DialogContent className="lab-lightbox" onCloseAutoFocus={(event) => { event.preventDefault(); imageOpener.current?.focus(); }} onKeyDown={(event) => { if (imageIndex === null) return; if (event.key === 'ArrowLeft') setImageIndex((imageIndex - 1 + images.length) % images.length); if (event.key === 'ArrowRight') setImageIndex((imageIndex + 1) % images.length); }}>
        <DialogTitle className="sr-only">{project.title}</DialogTitle><DialogDescription className="sr-only">{t('Ảnh dự án. Dùng phím trái và phải để chuyển ảnh.', 'Project images. Use left and right arrow keys to navigate.')}</DialogDescription>
        {imageIndex !== null && <><div className="lab-lightbox-image"><ContentImage src={images[imageIndex]} alt={project.title + ' — ' + (imageIndex + 1)} sizes="100vw" fit="contain" /></div><div className="lab-lightbox-controls"><button type="button" disabled={images.length < 2} onClick={() => setImageIndex((imageIndex - 1 + images.length) % images.length)} aria-label={t('Ảnh trước', 'Previous image')}><ChevronLeft /></button><span>{imageIndex + 1} / {images.length}</span><button type="button" disabled={images.length < 2} onClick={() => setImageIndex((imageIndex + 1) % images.length)} aria-label={t('Ảnh tiếp', 'Next image')}><ChevronRight /></button></div></>}
      </DialogContent>
    </Dialog>
  </main>;
}
