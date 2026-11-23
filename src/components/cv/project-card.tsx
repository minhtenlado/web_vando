'use client';

import { domainTone,STATUS_LABELS } from '@/lib/cv/domains';
import { plainText } from '@/lib/cv/presentation';
import { projectCategoryGroups } from '@/lib/cv/project-categories';
import type { SiteProject } from '@/lib/cv/site-data-server';
import { ArrowUpRight,Github } from 'lucide-react';
import Link from 'next/link';
import { ContentImage } from './content-image';
import { useLocale } from './locale-context';

export function StatusBadge({ status }: { status?: string }) {
  const { locale } = useLocale();
  const label = STATUS_LABELS[status || ''];
  if (!label) return null;
  return <span className="ui-status" data-status={status}>{locale === 'vi' ? label.vi : label.en}</span>;
}

export function DomainChips({ category }: { category?: string }) {
  const groups = projectCategoryGroups(category);
  if (!groups.length) return null;
  return <span className="ui-domain-chips">{groups.map((group) => <span key={group} data-tone={domainTone(group)}>{group}</span>)}</span>;
}

export function ProjectCard({ project, priority = false, feature = false, headingLevel = 3 }: {
  project: SiteProject; priority?: boolean; feature?: boolean; headingLevel?: 2 | 3;
}) {
  const { t } = useLocale();
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return <article className={'ui-project-card' + (feature ? ' is-feature' : '')}>
    <Link href={'/projects/' + encodeURIComponent(project.id)} className="ui-project-link">
      <div className="ui-project-media">
        <ContentImage src={project.image} alt="" fit="cover" priority={priority}
          sizes={feature ? '(max-width: 900px) calc(100vw - 40px), 760px' : '(max-width: 640px) calc(100vw - 40px), (max-width: 1100px) 46vw, 380px'} />
        <StatusBadge status={project.status} />
      </div>
      <div className="ui-project-body">
        <DomainChips category={project.category} />
        <Heading className="ui-project-title">{project.title}</Heading>
        <p className="ui-project-desc">{plainText(project.subtitle || project.description).slice(0, 220)}</p>
        {!!project.tech?.length && <ul className="ui-tags" aria-label={t('Công nghệ', 'Technologies')}>{project.tech.slice(0, feature ? 6 : 4).map((tech) => <li key={tech}>{tech}</li>)}</ul>}
      </div>
      <div className="ui-project-foot">
        <span>{project.year || '—'}</span>
        {project.repo && <span className="ui-project-source"><Github size={13} aria-hidden="true" />{t('Mã nguồn', 'Source')}</span>}
        <ArrowUpRight className="ui-project-arrow" size={17} aria-hidden="true" />
      </div>
    </Link>
  </article>;
}
