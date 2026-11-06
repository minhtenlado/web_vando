'use client';

import { plainText } from '@/lib/cv/presentation';
import { projectCategoryGroups } from '@/lib/cv/project-categories';
import type { SiteProject } from '@/lib/cv/site-data-server';
import { useLocale } from './locale-context';

export function ProjectSummary({ project }: { project: SiteProject }) {
  const { t } = useLocale();
  const statuses: Record<string, string> = {
    completed: t('Hoàn thành', 'Completed'), 'in-development': t('Đang phát triển', 'In development'),
    prototype: t('Nguyên mẫu', 'Prototype'), research: t('Nghiên cứu', 'Research'),
  };
  return <div className="lab-project-copy">
    <p className="lab-project-meta">{projectCategoryGroups(project.category).join(' · ')}{project.status && statuses[project.status] && <span>{statuses[project.status]}</span>}</p>
    <h3>{project.title}</h3>
    <p className="lab-project-description">{plainText(project.subtitle || project.description).slice(0, 220)}</p>
    {!!project.tech?.length && <ul className="lab-tech-list" aria-label={t('Công nghệ', 'Technologies')}>{project.tech.slice(0, 4).map((tech) => <li key={tech}>{tech}</li>)}</ul>}
  </div>;
}
