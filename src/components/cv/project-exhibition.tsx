'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { SiteProject } from '@/lib/cv/site-data-server';
import { ContentImage } from './content-image';
import { ProjectSummary } from './project-summary';
import { useLocale } from './locale-context';

/** Native vertical scroll, with independent readable links on every breakpoint. */
export function ProjectExhibition({ projects }: { projects: SiteProject[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { t } = useLocale();
  useEffect(() => {
    if (!root.current || !('IntersectionObserver' in window)) return;
    const visible = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
      const center = window.innerHeight * .45;
      const distance = (element: Element) => {
        const bounds = element.getBoundingClientRect();
        return Math.abs(bounds.top + bounds.height / 2 - center);
      };
      const current = [...visible].sort((a, b) => distance(a) - distance(b))[0];
      if (current) setActive(Number((current as HTMLElement).dataset.chapter));
    }, { rootMargin: '-25% 0px -35% 0px', threshold: [0, .25, .5, .75, 1] });
    root.current.querySelectorAll('[data-chapter]').forEach((chapter) => observer.observe(chapter));
    return () => observer.disconnect();
  }, [projects]);
  return <div className="exhibition-story" ref={root}>
    <div className="exhibition-stage" aria-hidden="true">
      {projects.map((project, index) => <div className="exhibition-frame" key={project.id} data-active={index === active}>
        <ContentImage src={project.image} alt="" sizes="(max-width: 900px) 100vw, 60vw" fit="contain" />
        <span className="exhibition-frame-caption">{String(index + 1).padStart(2, '0')} / {projectCategoryCaption(project)}</span>
      </div>)}
      <span className="exhibition-stage-label">ENGINEERING LAB / COLLECTION</span>
      <span className="exhibition-stage-cross">+</span>
    </div>
    <div className="exhibition-chapters">
      {projects.map((project, index) => <article key={project.id} data-chapter={index} data-active={index === active} className="exhibition-chapter" onMouseEnter={() => setActive(index)} onFocus={() => setActive(index)}>
        <Link href={'/projects/' + encodeURIComponent(project.id)}>
          <div className="exhibition-mobile-image"><ContentImage src={project.image} alt="" sizes="100vw" fit="contain" /></div>
          <div className="exhibition-chapter-top"><span>{String(index + 1).padStart(2, '0')}</span><ArrowUpRight size={24} aria-hidden="true" /></div>
          <ProjectSummary project={project} />
          <span className="exhibition-read">{t('Khám phá dự án', 'View project')}<span aria-hidden="true">↗</span></span>
        </Link>
      </article>)}
    </div>
  </div>;
}

function projectCategoryCaption(project: SiteProject) { return [project.year, project.title].filter(Boolean).join(' / '); }
