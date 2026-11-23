'use client';

import { plainText } from '@/lib/cv/presentation';
import { projectCategoryGroups } from '@/lib/cv/project-categories';
import type { SiteProject } from '@/lib/cv/site-data-server';
import { Github } from 'lucide-react';
import { useLocale } from './locale-context';

export function useProjectStatusLabel() {
  const { t } = useLocale();
  const statuses: Record<string, string> = {
    completed: t('Hoàn thành', 'Completed'), 'in-development': t('Đang phát triển', 'In development'),
    prototype: t('Nguyên mẫu', 'Prototype'), research: t('Nghiên cứu', 'Research'),
  };
  return (status?: string) => statuses[status || ''];
}

export function ProjectSummary({ project }: { project: SiteProject }) {
  const { t } = useLocale();
  const statusLabel = useProjectStatusLabel()(project.status);
  return <div className="lab-project-copy">
    <p className="lab-project-meta">
      <span className="lab-project-groups">{projectCategoryGroups(project.category).join(' · ')}</span>
      {statusLabel && <span className="lab-status" data-status={project.status}>{statusLabel}</span>}
      {project.repo && <span className="lab-project-source"><Github size={11} aria-hidden="true" />{t('Mã nguồn', 'Source')}</span>}
    </p>
    <h3>{project.title}</h3>
    <p className="lab-project-description">{plainText(project.subtitle || project.description).slice(0, 220)}</p>
    {!!project.tech?.length && <ul className="lab-tech-list" aria-label={t('Công nghệ', 'Technologies')}>{project.tech.slice(0, 4).map((tech) => <li key={tech}>{tech}</li>)}</ul>}
  </div>;
}
